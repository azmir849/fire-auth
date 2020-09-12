import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig);

function App() {
  const[newUser,setNewUser] =useState(false)

  const[user,setUser] =useState({
    isSignedIn :false,
    name:'',
    email :'',
    password:'',
    photo:'',
    error: '',
    success : ''
  })

  const provider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () =>{
    firebase.auth().signInWithPopup(provider)
    .then(res => {
      const {displayName , email, photoURL} = res.user;
      const signedInUser ={
        isSignedIn :true,
        name :displayName,
        email:email,
        photo:photoURL
      }
      setUser(signedInUser);
    }).catch(err =>{
      console.log(err);
      console.log(err.message);
    })  
  }

  const handleFbSignIn=() =>{
    firebase.auth().signInWithPopup(fbProvider)
    .then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log('fb user after sign In',user);
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  const handleSignOut =() =>{
    firebase.auth().signOut().
    then(res => {
      const signedOutUser ={
        isSignedIn : false,
        name :'',
        email:''
      }
      setUser(signedOutUser)
    }).catch(function(error) {
      // An error happened.
    });
  }
  const handleBlur =(event) => {
    let isFormValid =true;
    if(event.target.name === 'email'){
      isFormValid = /\S+@\S+\.\S+/.test(event.target.value);
    }
    if(event.target.name ==='password'){
      const isPasswordValid = event.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(event.target.value);
     isFormValid =isPasswordValid && passwordHasNumber;
    }
    if(isFormValid){
      const newUserInfo = {...user};
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  }

  const handleSubmit = (event) => {
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success =true;
        setUser(newUserInfo);
        updateUserName(user.name);
      })
      .catch(error => {
        // Handle Errors here.
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      });
    }

    if(!newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(res =>{
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success =true;
        setUser(newUserInfo);
        console.log('Sign In user info', res.user);
      })
      .catch(function(error) {
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      });
    }
    event.preventDefault();

    const updateUserName = name =>{
      const user = firebase.auth().currentUser;
      user.updateProfile({
        displayName: name
      }).then(function() {
        console.log('User name updated successfully')
      }).catch(function(error) {
        console.log(error)
      });
    }
  }

  return (
    <div className="App">
     {  
        user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> :
        <button onClick={handleSignIn}>Sign In</button>
     }<br/>
     <button onclick={handleFbSignIn}>Log In By Facebook</button>
      {
        user.isSignedIn &&
         <div>
            <h3> Welcome , {user.name}</h3>
            <p>Your Email : {user.email}</p>
            <img src={user.photo} alt=""></img>
        </div>
      }

      <h1>Our Own Authentication</h1>
      <input type="checkbox" onChange ={() => setNewUser(!newUser)}  name="newUser" id=""/>
      <label htmlFor="newUser">New User SignUp</label>
      <form onSubmit={handleSubmit}>
      {newUser && <input type="text" name="name" onBlur={handleBlur} placeholder="Your Name"/>}
      <br/>
      <input type="text" onBlur={handleBlur} name="email" placeholder="Your Email" required/>
      <br/>
      <input type="password" onBlur={handleBlur} name="password" placeholder="Your password" required/>
      <br/>
      <input type="submit" value={newUser ? 'SignUp' : 'SignIn'}/>
      </form>
      <p style ={{color : 'red'}}>{user.error}</p>
      {user.success && <p style ={{color : 'green'}}>User { newUser? 'created' : 'Logged In'} Successfully</p>}
    </div>
  );
}

export default App;
