import Missing from "./Missing";
import NewPost from "./NewPost";
import PostPage from "./PostPage";
import Header from "./Header";
import Nav from "./Nav";
import Home from "./Home";
import About from "./About";
import Footer from "./Footer";
import {Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { format  } from "date-fns";
import api from "./api/posts"
import EditPost from "./EditPost";
import useWindowSize from "./hooks/useWindowSize";



function App() {
  const [posts , setPosts] =useState([])
  const [search , setSearch]=useState('');
  const [searchRes , setSearchRes] = useState([]);
  const [postTitle , setPostTitle]=useState('')
  const [postBody ,setPostBody] = useState('')
  const navigate =useNavigate();
  const [editTitle , setEditTitle]=useState('')
  const [editBody , setEditBody]=useState('')
  const {width} =useWindowSize()

    useEffect(()=>{
      const fetchData = async()=>{
         try{
          const response= await api.get("/posts")
          setPosts(response.data)
         }catch(err){
          if(err.response){
            console.log(err.response.data)
            console.log(err.response.status)
            console.log(err.response.headers)
          }else{
            console.log(`Error ${err.message}`)
          }
         }
      }
      fetchData();
    },[])
  const handleSubmit = async(e)=>{
    e.preventDefault();
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const newPost = { id, title: postTitle, datetime, body: postBody };
    try{
        const response =await api.post("/posts" ,newPost)
        const allPosts= [...posts,response.data];
        setPosts(allPosts)
        setPostBody('')
        setPostTitle('')
        navigate('/')
    }catch(err){
        console.log(`Error ${err.message}`)
     }
    
  }

  useEffect(()=>{
      const filterSearch= posts.filter((post)=>((post.body).toLowerCase()).includes(search.toLowerCase())
      || ((post.title).toLowerCase()).includes(search.toLowerCase()));
      setSearchRes(filterSearch.reverse());
  },[posts,search])

  const handleDelete= async(id)=>{
     
     try{
      await api.delete(`/posts/${id}`)
      const postsList =posts.filter(post=>post.id!==id)
      setPosts(postsList);
      navigate('/')
     }
     catch(err){
      console.log(err.message)
     }
   }

   const handleEdit =async (id)=>{
      const datetime = format(new Date(), "MMMM dd , yyyy pp");
      const updatedPost ={id , title:editTitle, datetime , body :editBody}
      try{
        const response = await api.put(`/posts/${id}`,updatedPost )
        setPosts(posts.map(post=> post.id ? {... response.data }:post))
        setEditTitle("")
        setEditBody("")
        navigate("/")
      }
      catch(err){
        console.log(err.message)
      }

   }


  return (
    <div className="App">
    <Header title={"Preethiviraj Social Media App" } width={width}/>
    <Nav
    search={search}
    setSearch={setSearch}
    />
    <Routes>
      <Route path="/" element={<Home posts={searchRes}/>}/>
      <Route path="post">
        <Route index element={<NewPost
          handleSubmit={handleSubmit}
          setPostBody={setPostBody}
          setPostTitle={setPostTitle}
          postTitle={postTitle}
          postBody={postBody}/>}/>

        <Route path=":id" element={<PostPage posts={posts} handleDelete={handleDelete}/>}/>
        </Route>
      <Route path="/edit/:id" element={<EditPost 
          posts={posts}
          handleEdit={handleEdit}
          editTitle={editTitle}
          editBody={editBody}
          setEditTitle={setEditTitle}
          setEditBody={setEditBody} 
        />} 
      />
     <Route path="about" element={ <About/>}/>
     <Route path="*" element={ <Missing/>}/>

    </Routes> 
  
    <Footer/>
    </div>
  );
}

export default App;
