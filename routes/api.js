const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserPosts,
    uploadFile,
    createPosts,
    getPosts,
    getPostById
} = require('../controllers/apiController');

router.get('/users', getUsers);
router.get('/users/:id/posts', getUserPosts);
router.post('/files', uploadFile);
router.post('/posts', createPosts);
router.get('/posts', getPosts);
router.get('/posts/:postId', getPostById);

module.exports = router;
