import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../NavBar/NavBar";
import "./Feedback.css";

export default function Feedback() {
  const [feedback, setFeedback] = useState([]);
  const [activeFeedback, setActiveFeedback] = useState([]);
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/getFeedback")
      .then((res) => res.json())
      .then((data) => {
        setFeedback(data);
        setActiveFeedback(data[0]);
        console.log(data);
      });

    fetch("/getusertype")
      .then((res) => res.json())
      .then((data) => {
        setUserType(data["type"]);
      });
  }, []);

  const updateActiveFeedback = (data) => {
    setActiveFeedback(data);
  };

  return (
    <div className="order-main-bg">
      <NavBar userType={userType} />
      <div className="main-body d-flex justify-content-center align-items-center h-100">
        {/* <div className="main-header"> */}
        <div className="order-bg" style={{ width: 1000 }}>
          <h1 id="margins-top" style={{ color: "white", textAlign: "center" }}>
            Feedback
          </h1>
          <h5 id="margins-top" style={{ color: "white" }}>
            Users:
          </h5>
          <div className="d-flex flex-row">
            <div class="list-group mr-3" style={{ marginLeft: "10px" }}>
              {
                // Todo: active class
                feedback.map((feed) => (
                  // eslint-disable-next-line jsx-a11y/anchor-is-valid
                  <a
                    onClick={(event) => updateActiveFeedback(feed)}
                    href="#"
                    className={
                      "list-group-item list-group-item-action " +
                      (feed === activeFeedback ? "active" : "")
                    }
                    aria-current="true"
                  >
                    {feed.name}
                  </a>
                ))
              }
            </div>
            <div
              id="margins-bot"
              class="ml-3"
              style={{
                padding: "10px", // Add padding for better appearance
                borderRadius: "10px", // Set border-radius for rounded corners
                border: "2px solid white", // Set border style and color
                flex: "1",
                overflowY: "auto",
              }}
            >
              <p style={{ color: "white" }}>Name: {activeFeedback.name}</p>
              <p style={{ color: "white" }}>Email: {activeFeedback.email}</p>
              <p style={{ color: "white" }}>
                Message: {activeFeedback.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
