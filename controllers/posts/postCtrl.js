const expressAsyncHandler = require("express-async-handler");
const Filter = require("bad-words");
const fs = require("fs");
const Post = require("../../models/post/Post");
const validateMongodbId = require("../../utils/validateMongodb");
const User = require("../../models/user/User");

const cloudinaryUploadImg = require("../../utils/cloudinary");

// create Post----------------------
const createPostCtrl = expressAsyncHandler(async (req, res) => {
  // console.log(req.body);
  const { _id } = req.user;
  // validateMongodbId(req.body.user);
  //Check for bad words
  const filter = new Filter();
  const isProfane = filter.isProfane(req.body.title, req.body.description);
  //Block user
  if (isProfane) {
    await User.findByIdAndUpdate(_id, {
      isBlocked: true,
    });
    throw new Error(
      "Creating Failed because it contains profane words and you have been blocked"
    );
  }

  //1. get the path to img
  const localPath = `public/images/posts/${req.file.filename}`;
  //2.upload to cloudinary
  const imgUploaded = await cloudinaryUploadImg(localPath);

  // console.log(req.file);
  try {
    const post = await Post.create({
      ...req.body,
      user: _id,
      image:imgUploaded?.url,
    });
    res.json(post);
    //Remove uploaded img
   // fs.unlinkSync(localPath);
  } catch (error) {
    res.json(error);
  }
});

//--------------Fetch all posts --------------------------------//
const fetchPostsCtrl = expressAsyncHandler(async (req, res) => {
  const hasCategory =req.query.category
  try {
    //check if it has a category
    if(hasCategory){
      const posts = await Post.find({category:hasCategory}).populate("user").populate('comments').sort('-createdAt');
      res.json(posts)
    }else{
      const posts = await Post.find({}).populate("user").populate("user").populate('comments').sort("-createdAt");
    res.json(posts);
    }
    
  } catch (error) {
    res.json(error);
  }
});
//--------------Fetch a product--------------------------------//
const fetchPostCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const post = await Post.findById(id).populate("user").populate('comments');
    //update number of views
    await Post.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      { new: true }
    );
    res.json(post);
  } catch (error) {
    res.json(error);
  }
});


//--------------Update product--------------------------------//
const updatePostCtrl = expressAsyncHandler(async (req, res) => {
  console.log(req.user);
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        ...req.body,
        user:req.user?._id,
      },
      {
        new: true,
      }
    );
    res.json(post);
  } catch (error) {
    res.json(error);
  }
});

//--------------Delete product --------------------------------//
const deletePostCtrl =expressAsyncHandler(async (req,res)=>{
  const {id} = req.params;
  validateMongodbId(id);
  try{
  const post =await Post.findOneAndDelete(id);
  res.json(post);
  }catch(error){
    res.json(error)
  }
  res.json("Delete")

})



module.exports = {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  updatePostCtrl,
  deletePostCtrl,
};
