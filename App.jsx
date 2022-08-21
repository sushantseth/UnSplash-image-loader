import "../public/styles.css";   
import { useState, useEffect, Suspense } from "react";
import * as React from "react";
import Errorfallback from "./errorboundary";
import { ErrorBoundary } from "react-error-boundary";

//Lazy loading of images component in App.jsx
const Imagetag = React.lazy(() => import("./images.jsx"));


export default function App() {
  const [dataimg, setData] = useState([]);    //this state variable consists of all the document array retrieved from the unSplash API call.
  const [query, setQuery] = useState("latest"); //this state variable is used to store what has been typed in the input search bar
  const [button, setButton] = useState(false);  //this is used to confirm if the search button has been clicked or not
  const [isFetching, setIsFetching] = useState(false); //this is used to confirm whether the user is at the bottom of the page (infinite scrolling)
  let page = 1; //used this to update the page number for infinte scrolling

  
  const Access_Key = "MEWDDaeJVjvzSWgMCKmwKbG0qQZb2i1NobSbCz3dAYU";  //got it from upSplash website when creating a demo account


//this useEffect is used when the user enters the type of photo and clicks on the search button. 
//the search button is the criteria based on which the useEffect is being called.
  useEffect(() => {
    fetch(
      `https://api.unsplash.com/search/photos?page=${page}&per_page=30&query=${query}&client_id=${Access_Key}`
    )
      .then((res) => res.json())
      .then((data) => setData([...data.results]));
  }, [button]);


//An infinite scroll is triggered when you scroll to the bottom of the page. Therefore, we need to detect that the webpage scrollbar is at the end of the page.
//There are two parts to accomplishing that. First, we add an on scroll event listener to the Window object to call a function called handleScroll every time the window scrolls.
//The second part to detecting the bottom of the page is to check if the Window object’s inner height, plus the Document object’s scrollTop, is equal to the Document’s offsetHeight.
  
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
  }, []);


//this useEffect checks whether the isFetching state variable is true or false. if it is false it does nothing but if it is true then it calls fetchMorephotos function.
  useEffect(() => {
    if (!isFetching) {
      return;
    }
    fetchMorephotos();
  }, [isFetching]);

//this function as the name suggests fetch more photos and within it, it increases the page number which can be mentioned in the API call to show new set of images
//the new set of data is then added to the previous set of data (in line number 62) after 1 second.

  function fetchMorephotos() {
    page = page + 1;
    setTimeout(() => {
      fetch(
        `https://api.unsplash.com/search/photos?page=${page}&per_page=30&query=${query}&client_id=${Access_Key}`
      )
        .then((res) => res.json())
        .then((data) => setData((prev) => [...prev, ...data.results]));
      setIsFetching(false);
    }, 1000);
  }


//this is the function which is called on eventlistener every time the user scrolls the page and it checks whether the user is at the bottom of the page or not.
  function handleScroll() {
    window.onscroll = function (ev) {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        setIsFetching(true);

        console.log("isFetching");
      }
    };
  }

//this function captures the value given in the input search bar and updates the query state variable with the help of setQuery function.

  function inputfunction(e) {
    if (e.target.value === "") {
      setButton(false);
    }
    setQuery((prev) => e.target.value);
  }


//this function sets the state variable button to true which helps in calling the useEffect in line number 24.
  function searchbutton() {
    setButton(true);
  }
  
  
  return (
    <div className="App">
      <div className="inputandsubmitdiv">
        <input onChange={inputfunction} placeholder="Try Nature or trees..." />
        <button onClick={searchbutton}>Search</button>
      </div>

//created a list of card and used the dataimg state variable which is an array.

      <div className="itemclass">
        {dataimg.map((e) => {
          return (
            <div>
              <div className="card">
                <h4>{e.user.username}</h4>
                <p>{e.user.bio}</p>
                
 // Here from line number 114 to line 123 Lazily loaded Imagetag component has been mentioned. which is wrapped in Suspense component with a fallback.
 //I have wrapped the this entire code with ErrorBoundary. used NPM package to do so. Link to it: https://www.npmjs.com/package/react-error-boundary
 
                <ErrorBoundary
                  FallbackComponent={Errorfallback}
                  onReset={() => {
                    window.location.reload();
                  }}
                >
                  <Suspense fallback={<div>Loading image...</div>}>
                    <Imagetag src={e.urls.small} alt="val.alt_description" />
                  </Suspense>
                </ErrorBoundary>
              </div>
              <div className="hoverdetails">
                User Name: {e.user.name} <br />
                Likes Count: {e.user.total_likes}
              </div>
            </div>
          );
        })}
      </div>
      
//If the isFetching state variable is true which means that it is at the end of the page (check line 71) then the <p> tag is mentioned first and then
//a list of more images.

      {isFetching && <p>'Fetching more list items...'</p>}
    </div>
  );
}
