import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './Home.css';
import NavBar from '../NavBar/NavBar'

const Main = () => {
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState('');
    const [userType, setUserType] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch("/getallproducts").then(res => res.json()).then(data => {
            setProducts(data);
        });

        fetch("/getcart").then(res => res.json()).then(data => {
            setCart(data);
        });

        fetch("/getusertype").then(res => res.json()).then(data => {
            setUserType(data['type']);
            console.log(data['type'])
        });
    }, [])

    const handleCart = (e) => {
        console.log(cart)
        const id = e.target.id
        if(cart.includes(id)){
            setCart(cart.filter(item => item !== id));
            fetch("/removefromcart", {
                method:"POST",
                cache: "no-cache",
                headers:{
                    "Content-type":"application/json",
                },
                body:JSON.stringify({productID: id})
            })
        } else{
            setCart([...cart, id]);
            fetch("/addtocart", {
                method:"POST",
                cache: "no-cache",
                headers:{
                    "Content-type":"application/json",
                },
                body:JSON.stringify({productID: id})
            })
        }
    }

    const handleFilter = (e) => {
        fetch("/alterfilter", {
            method:"POST",
            cache: "no-cache",
            headers:{
                "Content-type":"application/json",
            },
            body:JSON.stringify({categoryID: category})
        }).then(res => res.json()).then(data => {
            setProducts(data);
        })
    }


    const handleDelete = (e) => {
        const id = e.target.value;
        fetch("/deleteproduct", {
            method:"POST",
            cache: "no-cache",
            headers:{
                "Content-type":"application/json",
            },
            body:JSON.stringify({id:id})
        }).then(res => res.json()).then(data => {
            setProducts(data);
        })
    }

    const handleSearch = () => {
        fetch("/searchproduct", {
            method:"POST",
            cache: "no-cache",
            headers:{
                "Content-type":"application/json",
            },
            body:JSON.stringify({search: search})
        }).then(res => res.json()).then(data => {
            setProducts(data);
        })
    }

    return (
        <div className="order-main-bg">
            <NavBar userType={userType}/>
            <div className="main-body">
                
            </div>
        </div>
    );
}

export default Main;