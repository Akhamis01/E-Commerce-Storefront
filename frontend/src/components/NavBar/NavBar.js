#include <stdio.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <sys/signal.h>
#include <sys/wait.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <dirent.h>
#include <unistd.h>
#include <sys/stat.h>
#include <netdb.h>

#define SERVER_TCP_PORT 3000
#define BUFLEN 256
#define LENGTH 512
#define dataSize 100

struct pdu_header
        {
            char type;
            unsigned int len;
            char data[dataSize];
        }server_header, transfer_PDU, receive_PDU, name, upload;

int main(int argc, char **argv){
    int n, i, bytes_to_read;
    int sd, port;
    struct hostent *hp;
    struct sockaddr_in server;
    struct stat fstat;
    char type,*host, *bp, rbuf[BUFLEN], sbuf[BUFLEN], wbuf[BUFLEN];
    char f_name[256];

    switch(argc){
        case 2:
            host = argv[1];
            port = SERVER_TCP_PORT;
            break;
        case 3:
            host = argv[1];
            port = atoi(argv[2]);
            break;
        default:
            fprintf(stderr, "Usage: %s host [port]\n", argv[0]);
            exit(1);
    }

    if (hp = gethostbyname(host)){
        bcopy(hp->h_addr, (char *)&server.sin_addr, hp->h_length);
    }
    else if (inet_aton(host, (struct in_addr *) &server.sin_addr)){
        fprintf(stderr, "Can't get servers address\n");
        exit(1);
    }

    if (connect(sd, (struct sockaddr *)&server, sizeof(server)) == -1) {
        fprintf(stderr, "Cant connect\n");
        exit(1);
    }

    int length;
    printf("What would you like to do? \n");
    printf("Press D for Download \n");
    printf("Press U for Upload \n");
    printf("Press L for a list of Files within Directory \n");
    printf("Press P to change the path \n");

    scanf("%c", &type);

    if (type == 'D') {
        printf("Enter the name of the file you wish to download : \n");
        n = read(0, transfer_PDU.data, 256);
        transfer_PDU.len = strlen(transfer_PDU.data);
        transfer_PDU.type = 'D';
        strcpy(f_name, transfer_PDU.data);
        strcpt(f_name,".txt");
        write(sd, &transfer_PDU, BUFLEN);
        n = read(sd, &receive_PDU, BUFLEN);
        if (receive_PDU.type != 'F'){
            printf("Error occured, file not received");
        }
        else {
            FILE *fp = fopen(f_name, "w+");
            fprintf(fp, "%s", receive_PDU.data);
            printf("File Received.\n");
            fclose(fp);
        }
    }

    else if(type == 'U'){
        printf("Enter the name of the file you want to upload");
        n = read(0, &name.data, BUFLEN);
        name.data[n-1] = '\0';
        name.len = strlen(name.data);
        name.type = 'U';
        printf("Name of file to upload: %s\n", name.data);
        write(sd, &name, BUFLEN);
        n = read(sd,&server_header, BUFLEN);
        if (server_header.type == 'R') {
            upload.type = 'F';
            printf("Sending %s. \n", name.data);
            if (strcmp(name.data,"happy") == 0){
                FILE *fp = fopen("happy.txt", "r");
                n = fread(upload.data,1,256,fp);
                write(sd, &upload, BUFLEN);
            }
            else if (strcmp(name.data,"revolver")==0)  {
                FILE *fp = fopen("revolver.txt", "r");
                n = fread(upload.data,1,256,fp);
                write(sd, &upload, BUFLEN);
            }
            else {
                write(sd, "Error \n", 6);
                perror("Cannot open the file");
            }
        }
    }

    else if (type == 'P') {
        transfer_PDU.type = 'P';
        printf("Enter the folder name you want \n");
        n = read(0, &transfer_PDU.data, BUFLEN);
        transfer_PDU.len = strlen(transfer_PDU.data);
        write(sd, &transfer_PDU, BUFLEN);
        n = read(sd, &receive_PDU, BUFLEN);
        if (receive_PDU.type != 'R') {
            printf("Server not ready yet\n");
        }
        else {
            printf("Path has been changed\n");
        }
    }

    else if (type == 'L') {
        transfer_PDU.type = 'L';
        printf("Enter Directory: \n");
        n = read(0, &transfer_PDU.data, BUFLEN);
        transfer_PDU.len = strlen(transfer_PDU.data);
        write(sd, &transfer_PDU, BUFLEN);
        if (receive_PDU.type == 'I') {
            printf("List of Directories : \n");
            printf("%s\n", receive_PDU.data); 
        }
        else if(receive_PDU.type == 'E'){
            printf("%c\n", receive_PDU.type);
            printf("NO such directory");
        }
        else {
            printf("%c", receive_PDU.type);
            printf("Error\n");
        }
    }
    close(sd);
    return(0);
}