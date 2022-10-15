const router = require('express').Router();
const { Giver, Post, Item } = require('../models');
const withAuth = require('../utils/auth');
const path = require("path");


router.get('/', withAuth, async(req, res) => { 
  console.log("hi");
  try {
    // Get all posts and JOIN with item and giver data
    const postData = await Post.findAll({
      include: [
        {
          model: Giver,
          attributes: ['username'],
        },
        {
          model: Item,
          attributes: ['name', 'description','giver_id']
        },
      ],
    });

    // SELECT * FROM ITEM;
    const itemData = await Item.findAll();
    // Sequelize accent not in JSON 
    // Sequelize => JSON  
    // items = []
    // for(let index = 0; index < itemData.length; index++){
    //   items.push(itemData[index].get({ plain: tr}))
    // }
    const items = itemData.map((item) => item.get({ plain: true }));
    
    // console.log(items);


    // Serialize data so the template can read it
    const posts = postData.map((post) => post.get({ plain: true }));
    //console.log(posts);
    // Pass serialized data and session flag into template
    res.render('homepage', { 
      posts, 
      items,
      logged_in: req.session.logged_in 
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GETTING LOGIN PAGE
router.get('/login', (req, res) => {
  // If the giver is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/');
    return;
  }

  res.render('loginpage');
});

router.get('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.render('loginpage');
    });
  } else {
    res.render('loginpage', { logged_in: false });
  }
});

// GETTING SIGNUP PAGE
router.get('/signup', (req, res) => {
  if(req.session.logged_in) {
      res.redirect('/');
      return;
  } else {
      res.render('signup');
  }
})

router.get('/profile', withAuth, async (req, res) => {
  console.log("hi");
  try {
    // Get all posts and JOIN with item and giver data
    const postData = await Post.findAll({
      where: {
        giver_id: req.session.user_id
      },
      include: [
        {
          model: Giver,
          attributes: ['username', 'id'],
        },
        {
          model: Item,
          attributes: ['name', 'description', 'giver_id']
        },
      ],
    });

    // SELECT * FROM ITEM;
    const itemData = await Item.findAll({ 
      where: {
        giver_id: req.session.user_id
      },
    });
    console.log(req.session.user_id)
    const items = itemData.map((item) => item.get({ plain: true }));
    console.log(items);

    // Serialize data so the template can read it
    const posts = postData.map((post) => post.get({ plain: true }));
    //console.log(posts);
    // Pass serialized data and session flag into template
    res.render('profile', { 
      posts, 
      items,
      logged_in: req.session.logged_in 
    });
  } catch (err) {
    res.status(500).json(err);
  }
});




module.exports = router;