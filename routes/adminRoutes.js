const express = require('express');
const router = express();
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn, isAdmin } = require('../middlewares/index');
const mongoose = require('mongoose');
const Admin = mongoose.model('Admin');
const Insta = mongoose.model('Insta');
const Youtube = mongoose.model('Youtube');
const Blog = mongoose.model('Blog');
const multer = require('multer');
const { storage } = require('../cloudinary');
const passport = require('passport');
const upload = multer({ storage });
const { uploader } = require('cloudinary').v2




router.get('/admin/signup', wrapAsync(async (req, res) => {
    res.render('./admin/signup');
}));

router.post('/signup', wrapAsync(async (req, res) => {
    const { username, password } = req.body;
    const foundAdmin = await Admin.find({ username });
    if (foundAdmin.length) {
        req.flash('error', 'Admin is already registered!');
        return res.redirect('/admin/signup')
    }
    const admin = new Admin({ username, role: 'admin' });
    const registeredAdmin = await Admin.register(admin, password, function (err, newAdmin) {
        if (err) {
            next(err)
        }
        req.logIn(newAdmin, () => {
            res.redirect('/admin/instagram/posts')
        })
    })
}));


router.get('/admin/login', wrapAsync(async (req, res) => {
    res.render('./admin/login');
}));

router.post('/login', passport.authenticate('admin', { failureRedirect: '/admin/login', failureFlash: { type: 'error', message: 'Invalid Email or Password' } }), wrapAsync(async (req, res) => {
    res.redirect('/admin/instagram/posts')
}));

router.get('/logout', wrapAsync(async (req, res) => {
    req.logout(req.user, () => {
        req.flash('success', 'Admin is now logged out!')
        res.redirect('/admin/login')
    })
}))


router.get('/admin/instagram/posts', isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
    const posts = await Insta.find({});
    res.render('./admin/instagram', { posts });
}));

router.post('/instagram', upload.single('image'), isAdmin, async (req, res) => {
    try {
        const post = new Insta({
          name: req.body.name,
          description: req.body.description,
          imageFilename: req.file.filename,
          imagePath: req.file.path,
        });
        await post.save();
        req.flash('success', 'Service has been added successfully');
    
        res.redirect('/admin/instagram/posts');
      } catch (error) {
        console.error('Error uploading image:', error);
        req.flash('error', 'Error Uploading content');
        res.status(500).json({ message: 'Error uploading image', error: error.message });
      }
});

router.get('/instagram/edit/:id', isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Insta.findById(id);
    res.render('./admin/editinsta', { post });
}));


// Update Services Content Route
router.post('/instagram/:id', upload.single('image'), isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Insta.findById(id);
      if (!post) {
        req.flash('error', 'Service content not found');
        return res.redirect('/admin/instagram/posts');
      }
      post.name = req.body.name;
      post.description = req.body.description;
      if (req.file) {
        post.imageFilename = req.file.filename;
        post.imagePath = req.file.path;
      }
      await post.save();
      req.flash('success', 'Service content updated successfully');
      res.redirect('/admin/instagram/posts');
    } catch (error) {
      console.error('Error updating Service content:', error);
      res.status(500).json({ message: 'Error updating Service content', error: error.message });
    }
  });

router.post('/instagram/delete/:id', isAdmin, async (req, res) => {
    try {
      const deleteservice = await Insta.findByIdAndDelete(req.params.id);
      await Insta.destroy(deleteservice.image.filename);
      req.flash('success', 'Service has been deleted successfully');
      res.redirect('/admin/youtube/posts');
    } catch (error) {
      console.error('Error deleting Service:', error);
      res.status(500).json({ message: 'Error deleting Service', error: error.message });
    }
  });


router.get('/admin/youtube/posts', isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
    const posts = await Youtube.find({});
    res.render('./admin/youtube', { posts });
}));

router.post('/youtube', upload.single('image'), isAdmin, async (req, res) => {
    try {
        const post = new Youtube({
          name: req.body.name,
          description: req.body.description,
          detail: req.body.detail,
          url: req.body.url,
          heart: req.body.heart,
          view: req.body.view,
          imageFilename: req.file.filename,
          imagePath: req.file.path,
        });
        await post.save();
        req.flash('success', 'Podcast has been added successfully');
    
        res.redirect('/admin/youtube/posts');
      } catch (error) {
        console.error('Error uploading image:', error);
        req.flash('error', 'Error Uploading content');
        res.status(500).json({ message: 'Error uploading image', error: error.message });
      }
});



router.get('/youtube/edit/:id', isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Youtube.findById(id);
    res.render('./admin/edityoutube', { post });
}));


// Update Youtube Content Route
router.post('/youtube/:id', upload.single('image'), isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Youtube.findById(id);
      if (!post) {
        req.flash('error', 'Podcast content not found');
        return res.redirect('/admin/youtube/posts');
      }
      post.name = req.body.name;
      post.description = req.body.description;
      post.detail = req.body.detail;
      post.url = req.body.url;
      post.heart = req.body.heart;
      post.view = req.body.view;
      if (req.file) {
        post.imageFilename = req.file.filename;
        post.imagePath = req.file.path;
      }
      await post.save();
      req.flash('success', 'Podcast content updated successfully');
      res.redirect('/admin/youtube/posts');
    } catch (error) {
      console.error('Error updating Podcast content:', error);
      res.status(500).json({ message: 'Error updating Podcast content', error: error.message });
    }
  });
  
  router.post('/youtube/delete/:id', isAdmin, async (req, res) => {
    try {
      const deletepodcast = await Youtube.findByIdAndDelete(req.params.id);
      await uploader.destroy(deletepodcast.image.filename);
      req.flash('success', 'Podcast has been deleted successfully');
      res.redirect('/admin/youtube/posts');
    } catch (error) {
      console.error('Error deleting Podcast:', error);
      res.status(500).json({ message: 'Error deleting Podcast', error: error.message });
    }
  });


router.get('/admin/blogs/posts', isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
    const blogs = await Blog.find({});
    res.render('./admin/blogs', { blogs });
}));


router.post('/blog', upload.single('image'), isAdmin, async (req, res) => {
    try {
        const post = new Blog({
          name: req.body.name,
          description: req.body.description,
          date: req.body.date,
          url: req.body.url,
          from: req.body.from,
          imageFilename: req.file.filename,
          imagePath: req.file.path,
        });
        await post.save();
        req.flash('success', 'Blog has been added successfully');
    
        res.redirect('/admin/blogs/posts');
      } catch (error) {
        console.error('Error uploading image:', error);
        req.flash('error', 'Error Uploading content');
        res.status(500).json({ message: 'Error uploading image', error: error.message });
      }
});

router.get('/blog/edit/:id', isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    res.render('./admin/editblog', { blog });
}));

// Update Youtube Content Route
router.post('/blog/:id', upload.single('image'), isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const blog = await Blog.findById(id);
      if (!blog) {
        req.flash('error', 'Blog content not found');
        return res.redirect('/admin/blogs/posts');
      }
      blog.name = req.body.name;
      blog.description = req.body.description;
      blog.date = req.body.date;
      blog.url = req.body.url;
      blog.from = req.body.from;
      if (req.file) {
        blog.imageFilename = req.file.filename;
        blog.imagePath = req.file.path;
      }
      await blog.save();
      req.flash('success', 'Blog content updated successfully');
      res.redirect('/admin/blogs/posts');
    } catch (error) {
      console.error('Error updating Blog content:', error);
      res.status(500).json({ message: 'Error updating Blog content', error: error.message });
    }
  });


  router.post('/blog/delete/:id', isAdmin, async (req, res) => {
    try {
      const deleteblog = await Blog.findByIdAndDelete(req.params.id);
      await uploader.destroy(deleteblog.image.filename);
      req.flash('success', 'Blog has been deleted successfully');
      res.redirect('/admin/blogs/posts');
    } catch (error) {
      console.error('Error deleting Podcast:', error);
      res.status(500).json({ message: 'Error deleting Podcast', error: error.message });
    }
  });


// Exporting the router
module.exports = router;