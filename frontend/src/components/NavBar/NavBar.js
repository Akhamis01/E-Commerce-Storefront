import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './NavBar.css';

const NavBar = ({ userType }) => {
   const handleLogout = (e) => {
      fetch('/logout', {
         method: 'GET',
         cache: 'no-cache',
         headers: {
            'Content-type': 'application/json',
         },
      });
   };

   return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
         <div className="container-fluid d-flex">
            <div className="flex-grow-1">
               <a href="/home">
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width="40"
                     height="40"
                     fill="currentColor"
                     class="bi bi-house"
                     viewBox="0 0 16 16"
                  >
                     <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
                  </svg>
               </a>
            </div>
            <button
               className="navbar-toggler"
               type="button"
               data-mdb-toggle="collapse"
               data-mdb-target="#navbarSupportedContent"
               aria-controls="navbarSupportedContent"
               aria-expanded="false"
               aria-label="Toggle navigation"
            >
               <i className="fas fa-bars"></i>
            </button>
            {/* <div className="collapse navbar-collapse" id="navbarSupportedContent"> */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
               {userType === 'admin' ? (
                  <li className="nav-item">
                     {
                        <a className="btn-primary me-3 btn" href="/addproduct">
                           Add Products
                        </a>
                     }
                  </li>
               ) : null}
            </ul>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
               {userType === 'admin' ? (
                  <li className="nav-item">
                     <a
                        type="button"
                        className="btn btn-primary me-3"
                        href="/feedback"
                     >
                        Feedback
                     </a>
                  </li>
               ) : null}
            </ul>
            <div className="d-flex align-items-center">
               {
                  <a
                     href="/orders"
                     type="button"
                     className="btn btn-secondary me-3"
                  >
                     Orders
                  </a>
               }
               {userType !== 'admin' ? (
                  <a
                     type="button"
                     className="btn btn-primary me-3"
                     href="/cart"
                  >
                     Cart
                  </a>
               ) : null}
               <a
                  href="/login"
                  onClick={handleLogout}
                  type="button"
                  className="btn btn-primary me-3"
               >
                  Logout
               </a>
            </div>
            {/* </div> */}
         </div>
      </nav>
   );
};

export default NavBar;
