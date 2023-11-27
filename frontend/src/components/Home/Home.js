import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Link } from 'react-router-dom';
import NavBar from '../NavBar/NavBar';
import './Home.css';

const Footer = () => {
   return (
      <footer className="footer footer-hidden">
         <div className="footer-content">
            <p>&copy; 2023 E-StoreFront. All rights reserved.   <Link to="/contact">Contact us</Link></p>
         </div>
      </footer>
   );
};

const Main = () => {
   const [cart, setCart] = useState([]);
   const [products, setProducts] = useState([]);
   const [category, setCategory] = useState('All');
   const [userType, setUserType] = useState('');
   const [search, setSearch] = useState('');

   const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const threshold = 100;
  
      if (scrollTop + windowHeight >= documentHeight - threshold) {
        document.querySelector('.footer').classList.remove('footer-hidden');
      } else {
        document.querySelector('.footer').classList.add('footer-hidden');
      }
    };
  
    useEffect(() => {
      window.addEventListener('scroll', handleScroll);
  
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

   useEffect(() => {
      fetch('/getallproducts')
         .then((res) => res.json())
         .then((data) => {
            setProducts(data);
         });

      fetch('/getcart')
         .then((res) => res.json())
         .then((data) => {
            setCart(data);
         });

      fetch('/getusertype')
         .then((res) => res.json())
         .then((data) => {
            setUserType(data['type']);
         });
   }, []);

   const handleCart = (e) => {
      console.log(cart);
      const id = e.target.id;
      if (cart.includes(id)) {
         setCart(cart.filter((item) => item !== id));
         fetch('/removefromcart', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
               'Content-type': 'application/json',
            },
            body: JSON.stringify({ productID: id }),
         });
      } else {
         setCart([...cart, id]);
         fetch('/addtocart', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
               'Content-type': 'application/json',
            },
            body: JSON.stringify({ productID: id }),
         });
      }
   };

   const handleFilter = (e) => {
      fetch('/alterfilter', {
         method: 'POST',
         cache: 'no-cache',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify({ category: category }),
      })
         .then((res) => res.json())
         .then((data) => {
            setProducts(data);
         });
   };

   const handleDelete = (e) => {
      const id = e.target.value;
      fetch('/deleteproduct', {
         method: 'POST',
         cache: 'no-cache',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify({ id: id }),
      })
         .then((res) => res.json())
         .then((data) => {
            setProducts(data);
         });
   };

   const handleSearch = () => {
      fetch('/searchproduct', {
         method: 'POST',
         cache: 'no-cache',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify({ search: search }),
      })
         .then((res) => res.json())
         .then((data) => {
            setProducts(data);
         });
   };

   return (
      <div className="order-main-bg">
         <NavBar userType={userType} />
         <header className="home-header">
            <h1 style={{ color: 'white' }}>Welcome to the StoreFront!</h1>
            <select onChange={(e) => setCategory(e.target.value)}>
               <option value="All">All</option>
               <option value="Electronics">Electronics</option>
               <option value="Games">Games</option>
               <option value="Appliances">Appliances</option>
               <option value="Comics">Comics</option>
               <option value="Hats">Hats</option>
            </select>
            <button
               type="button"
               onClick={handleFilter}
               className={`btn btn-outline-info`}
            >
               Apply filter
            </button>
            <input onChange={(event) => setSearch(event.target.value)} />
            <button
               type="button"
               onClick={handleSearch}
               className={`btn btn-outline-info`}
            >
               Search product
            </button>
         </header>

         <section className="home-section">
            {products.map((product, id) => (
               <div class="product-home">
                  <img src={product.picture} alt={product.productName} />
                  <h3>{product.productName}</h3>
                  <h6 style={{ color: 'grey', fontStyle: 'italic', fontSize: '1em', marginTop: '5px' }}>{product.category}</h6>
                  <p>$ {product.price.toFixed(2)} CAD</p>
                  {userType === 'admin' && (
                     <p>Amt. Available: {product.quantity}</p>
                  )}
                  {userType !== 'admin' ? (
                     cart.includes(product.id.toString()) ? (
                        <button
                           type="button"
                           id={product.id}
                           onClick={handleCart}
                           className={`add-to-cart-button selected`}
                        >
                           Remove from Cart
                        </button>
                     ) : (
                        <button
                           type="button"
                           id={product.id}
                           onClick={handleCart}
                           className={`add-to-cart-button`}
                        >
                           Add to Cart
                        </button>
                     )
                  ) : (
                     <button
                        type="button"
                        value={product.id}
                        onClick={handleDelete}
                        className={`add-to-cart-button selected`}
                     >
                        Delete Product
                     </button>
                  )}
               </div>
            ))}
         </section>

         <Footer />
      </div>
   );
};

export default Main;
