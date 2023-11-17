import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './AddProduct.css';

const AddProduct = () => {
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [products, setProducts] = useState([]);
    const [menu, setMenu] = useState('Use existing product');
    const [element, setElement] = useState(false);
    const [disp, setDisp] = useState('block');
    const [disp2, setDisp2] = useState('none');
    const [category, setCategory] = useState('Tshirt');
    const [productID, setProductID] = useState('');
    const [price, setPrice] = useState(0);
    const [picture, setPicture] = useState('');
    const [userType, setUserType] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        fetch("/getexistingproducts").then(res => res.json()).then(data => {
            setProducts(data);
        });

        fetch("/getusertype").then(res => res.json()).then(data => {
            setUserType(data['type']);
        });
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault();

        if(disp2 === 'none'){
            fetch("/addproduct", {
                method:"POST",
                cache: "no-cache",
                headers:{
                    "Content-type":"application/json",
                },
                body:JSON.stringify({productName: productName, productDescription: productDescription, category:category, price:price, picture:picture})
            }).then(res => res.json()).then(res => {
                if(res['alert'] === 'success'){
                    navigate("/home");
                }
            })

        } else{
            fetch("/addexistingproduct", {
            method:"POST",
            cache: "no-cache",
            headers:{
                "Content-type":"application/json",
            },
            body:JSON.stringify({'productID': productID})
            }).then(res => res.json()).then(res => {
                if(res['alert'] === 'success'){
                    navigate("/home");
                }
            })
        }
    };


    const handleMenu = (e) => {
        e.preventDefault();
        if(element === false){
            setElement(true);
            setMenu('Add new product');
            setDisp('none');
            setDisp2('block');
        } else{
            setElement(false);
            setMenu('Use existing product');
            setDisp('block');
            setDisp2('none');
        }
    }

    return (
        <div className="register-bodyy">
            <div className="login-form">
                <form onSubmit={handleSubmit} className="container" action="/home" method="get">
                    <h1>Add a Product to Inventory</h1>
                    <button id="register" onClick={handleMenu} className="btn btn-primary btn-rounded">{menu}</button>
                    <hr/>

                    <div style={{display: `${disp}`}}>
                        <div className="form-group">
                            <label htmlFor="username"><b>Product Name</b></label>
                            <input id="username-check" type="text" placeholder="Product Name" name="username" className="form-control" onChange={ (event) => setProductName(event.target.value) }/>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password"><b>Product Description</b></label>
                            <input id="pass" type="text" placeholder="Product Description" name="password" className="form-control" onChange={ (event) => setProductDescription(event.target.value) }/>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password"><b>Price</b></label>
                            <input id="pass-confirm" type="number" step="0.01" placeholder="Price" name="confirmation" className="form-control" onChange={ (event) => setPrice(event.target.value) }/>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password"><b>Picture URL</b></label>
                            <input id="pass-confirm" type="text" placeholder="Picture URL" name="confirmation" className="form-control" onChange={ (event) => setPicture(event.target.value) }/>
                        </div>

                        <div id="selection-user" className="form-group">
                            <label htmlFor="pick-user"><b>Category</b></label>
                            <select id="pick-user" className="form-control" name="pick-user" onChange={ (event) => setCategory(event.target.value) }>
                                <option key={0} value="Tshirt">Tshirt</option>
                                <option key={1} value="Pants">Pants</option>
                                <option key={2} value="Jacket">Jacket</option>
                                <option key={3} value="Sweater">Sweater</option>
                                <option key={4} value="Socks">Socks</option>
                            </select>
                        </div>
                    </div>


                    <div style={{display: `${disp2}`}}>
                        <div id="selection-user" className="form-group">
                            <label htmlFor="pick-product"><b>Choose an existing product</b></label>
                            <select id="pick-user" className="form-control" name="pick-product" onChange={ (event) => setProductID(event.target.value) }>

                                {products.map((product, id) => (
                                    <option key={product.id} value={product.id}>{product.productName}</option>
                                ))}

                            </select>
                        </div>
                    </div>

                    {
                        ( (productName && productDescription && price && picture) || (disp2 === 'block')) ? (
                            <button id="register" className="btn btn-primary btn-rounded" type="submit">Add Product</button>
                        ) : (
                            <button id="register" className="btn btn-primary btn-rounded" type="submit" disabled>Add Product</button>
                        )
                    }
                    
                    <hr/>
                    <a className="btn btn-primary btn-rounded" href="/home">Go back!</a>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;