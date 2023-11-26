import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Link } from 'react-router-dom';
import NavBar from '../NavBar/NavBar'
import './Home.css';

const Main = () => {
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState('All');
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
            body:JSON.stringify({'category': category})
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
            body:JSON.stringify({'search': search})
        }).then(res => res.json()).then(data => {
            setProducts(data);
        })
    }

    return (
        <div className="order-main-bg">
            <NavBar userType={userType}/>
            <header className='home-header'>
                <h1 style={{color: "white"}}>All Products</h1>
                <select onChange={(e) => setCategory(e.target.value)}>
                    <option value='All'>All</option>
                    <option value='Tshirt'>Tshirt</option>
                    <option value='Pants'>Pants</option>
                    <option value='Jacket'>Jacket</option>
                    <option value='Sweater'>Sweater</option>
                    <option value='Socks'>Socks</option>
                </select>
                <button type="button" onClick={handleFilter} className={`btn btn-outline-info`}>Apply filter</button>
                <br></br>
                <input onChange={ (event) => setSearch(event.target.value) }/>
                <button type="button" onClick={handleSearch} className={`btn btn-outline-info`}>Search product</button>
            </header>

            <section className='home-section'>

                {products.map((product, id) => (

                    <div class="product-home">
                        <img src={product.picture} alt={product.productName} />
                        <h3>{product.productName}</h3>
                        <h5>{product.category}</h5>
                        <p>$ {(product.price).toFixed(2)} CAD</p>
                        <p>Amt. Available: {product.quantity}</p>
                        {
                            (userType !== 'admin') ? (
                                (cart.includes(product.id.toString())) ? (
                                    <button type="button" id={product.id} onClick={handleCart} className={`add-to-cart-button selected`}>Remove from Cart</button>
                                ) : <button type="button" id={product.id} onClick={handleCart} className={`add-to-cart-button`}>Add to Cart</button>
                            ) : <button type="button" value={product.id} onClick={handleDelete} className={`add-to-cart-button selected`}>Delete Product</button>
                        }
                    </div>
                ))}

            </section>


            <footer className="footer">
                <div className="footer-content">
                    <p>&copy; 2023 E-StoreFront. All rights reserved.</p>
                    <p><Link to="/contact">Contact us</Link></p>
                </div>
            </footer>
        </div>
    );
}

export default Main;