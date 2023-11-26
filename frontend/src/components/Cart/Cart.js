import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../NavBar/NavBar';
import './Cart.css';

export default function Cart() {
   const [cardName, setCardName] = useState('');
   const [cardNum, setCardNum] = useState('');
   const [cardType, setCardType] = useState('mastercard');
   const [cardDate, setCardDate] = useState('');
   const [cardCVV, setCardCVV] = useState('');
   const [cardFound, setCardFound] = useState(false);
   const [cart, setCart] = useState([]);
   const [userType, setUserType] = useState('');
   const [discount, setDiscount] = useState(0.0);
   const navigate = useNavigate();

   useEffect(() => {
      fetch('/getallcart')
         .then((res) => res.json())
         .then((data) => {
            setCart(data);
            console.log(data);
         });

      fetch('/getusertype')
         .then((res) => res.json())
         .then((data) => {
            setUserType(data['type']);
         });

      fetch('/trypaymentinfo', {
         method: 'POST',
         cache: 'no-cache',
         headers: {
            'Content-type': 'application/json',
         },
      })
         .then((res) => res.json())
         .then((res) => {
            if (res['alert'] !== 'error') {
               setCardType(res['paymentProvider']);
               setCardName(res['name']);
               setCardNum(res['cardNum']);
               setCardCVV(res['cvv']);
               setCardDate(res['date']);
               setCardFound(true);
            }
         });
   }, []);

   const getTotalSum = () => {
      return cart.reduce(
         (sum, { price, quantity }) => sum + price * quantity,
         0,
      );
   };

   const removeFromCart = (e, productToRemove) => {
      let productID = e.target.value;
      setCart(cart.filter((product) => product !== productToRemove));
      fetch('/removefromcart', {
         method: 'POST',
         cache: 'no-cache',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify({ productID: productID }),
      });
   };

   const handleCheckout = () => {
      fetch('/removefrominventory').then((res) => res.json());
      fetch('/clearcart')
         .then((res) => res.json())
         .then((data) => {
            setCart([]);
         });
      fetch('/addpayment', {
         method: 'POST',
         cache: 'no-cache',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify({
            cardType: cardType,
            cardName: cardName,
            cardNum: cardNum,
            cardDate: cardDate,
            cardCVV: cardCVV,
         }),
      })
         .then((res) => res.json())
         .then((res) => {
            if (res['alert'] === 'success') {
               navigate('/home');
            }
         });
   };

   const handleDiscount = () => {
      fetch('/getdiscount')
         .then((res) => res.json())
         .then((res) => {
            console.log(res['discount']);
            setDiscount(parseFloat(res['discount']));
         });
   };
   const discountedTotal = (
      (getTotalSum() - discount * getTotalSum()) *
      1.13
   ).toFixed(2);

   return (
      <div className="order-main-bg">
         <NavBar userType={userType} />
         <div className="row no-gutters center">
            <div>
               <a className="btn btn-primary btn-rounded" href="/home">
                  Back to shopping
               </a>
            </div>
            <div className="col-md-8">
               <div className="product-details mr-2 bod">
                  <h1 className="mb-0">Shopping cart</h1>
                  <p></p>
                  <div className="products">
                     {cart.map((product, idx) => (
                        <div className="product shadow" key={product.id}>
                           <div className="d-flex justify-content-between align-items-center mt-3 p-2 items rounded">
                              <div className="d-flex flex-row">
                                 <img
                                    className="rounded"
                                    src={product.picture}
                                    width="100"
                                    alt=""
                                 />
                                 <i className="fa fa-trash-o ml-3 text-black-50"></i>
                              </div>
                              <div className="ml-2">
                                 <span className="font-weight-bold d-block">
                                    {product.productName}
                                 </span>
                              </div>
                              <span className="d-block ml-5 font-weight-bold">
                                 $ {product.price.toFixed(2)} CAD
                              </span>
                              <div className="ml-2">
                                 <span className="font-weight-bold d-block">
                                    Quantity: {product.quantity}
                                 </span>
                              </div>
                              <button
                                 value={product.id}
                                 className={`btn btn-outline-info`}
                                 onClick={(e) => removeFromCart(e, product)}
                              >
                                 Remove
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
                  <div>
                     <h3 className="center">Total: $ {discountedTotal} CAD</h3>
                  </div>
               </div>
            </div>
            <div className="col-md-4">
               <div className="payment-info">
                  <div className="d-flex justify-content-between align-items-center">
                     <h4>Card details</h4>
                  </div>
                  <span className="type d-block mt-3 mb-1">Card type</span>
                  <label className="radio">
                     {' '}
                     <input
                        onClick={(event) => setCardType(event.target.value)}
                        type="radio"
                        name="card"
                        value="mastercard"
                        defaultChecked
                     />{' '}
                     <span>
                        <img
                           width="30"
                           src="https://img.icons8.com/color/48/000000/mastercard.png"
                           alt=""
                        />
                     </span>{' '}
                  </label>
                  <label className="radio">
                     {' '}
                     <input
                        onClick={(event) => setCardType(event.target.value)}
                        type="radio"
                        name="card"
                        value="visa"
                     />{' '}
                     <span>
                        <img
                           width="30"
                           src="https://img.icons8.com/officel/48/000000/visa.png"
                           alt=""
                        />
                     </span>{' '}
                  </label>
                  <label className="radio">
                     {' '}
                     <input
                        onClick={(event) => setCardType(event.target.value)}
                        type="radio"
                        name="card"
                        value="amex"
                     />{' '}
                     <span>
                        <img
                           width="30"
                           src="https://img.icons8.com/ultraviolet/48/000000/amex.png"
                           alt=""
                        />
                     </span>{' '}
                  </label>
                  <label className="radio">
                     {' '}
                     <input
                        onClick={(event) => setCardType(event.target.value)}
                        type="radio"
                        name="card"
                        value="paypal"
                     />{' '}
                     <span>
                        <img
                           width="30"
                           src="https://img.icons8.com/officel/48/000000/paypal.png"
                           alt=""
                        />
                     </span>{' '}
                  </label>

                  <div>
                     <label className="credit-card-label">Name on card</label>
                     <input
                        value={cardName}
                        type="text"
                        className="form-control credit-inputs"
                        placeholder="Name"
                        onChange={(event) => setCardName(event.target.value)}
                     />
                  </div>
                  <div>
                     <label className="credit-card-label">Card number</label>
                     <input
                        value={cardNum}
                        type="text"
                        className="form-control credit-inputs"
                        placeholder="0000 0000 0000 0000"
                        onChange={(event) => setCardNum(event.target.value)}
                     />
                  </div>
                  <div className="row">
                     <div className="col-md-6">
                        <label className="credit-card-label">Expiry</label>
                        <input
                           value={cardDate}
                           type="text"
                           className="form-control credit-inputs"
                           placeholder="MM/YY"
                           onChange={(event) => setCardDate(event.target.value)}
                        />
                     </div>
                     <div className="col-md-6">
                        <label className="credit-card-label">CVV</label>
                        <input
                           value={cardCVV}
                           type="text"
                           className="form-control credit-inputs"
                           placeholder="342"
                           onChange={(event) => setCardCVV(event.target.value)}
                        />
                     </div>
                  </div>

                  {cardFound ? (
                     <p>Loaded details from previous records.</p>
                  ) : null}

                  <hr className="line" />
                  <div className="d-flex justify-content-between information">
                     <span>Subtotal</span>
                     <span>$ {getTotalSum().toFixed(2)} CAD</span>
                  </div>
                  <div className="d-flex justify-content-between information">
                     <span>
                        Total (Tax incl.) and {discount * 100}% discount
                     </span>
                     <span>$ {discountedTotal} CAD</span>
                  </div>
                  <button
                     onClick={handleDiscount}
                     className={
                        'btn btn-primary btn-block d-flex justify-content-between mt-3'
                     }
                  >
                     Check for discount
                  </button>

                  {((cardName && cardNum && cardDate && cardCVV) ||
                     cardFound) &&
                  cart.length > 0 ? (
                     <button
                        onClick={handleCheckout}
                        className="btn btn-primary btn-block d-flex justify-content-between mt-3"
                        type="button"
                     >
                        <span>
                           Checkout
                           <i className="fa fa-long-arrow-right ml-1"></i>
                        </span>
                     </button>
                  ) : (
                     <button
                        onClick={handleCheckout}
                        className="btn btn-primary btn-block d-flex justify-content-between mt-3"
                        type="button"
                        disabled
                     >
                        <span>
                           Checkout
                           <i className="fa fa-long-arrow-right ml-1"></i>
                        </span>
                     </button>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
