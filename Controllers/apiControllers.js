const axios = require('axios');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configuration Multer for management file
const uploadDirectory = path.join(__dirname, '../public/images');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: File type not allowed!');
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).single('file');

const getUsers = async (req, res) => {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/users');
        const users = response.data.slice(0, 10); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des utilisateurs.' });
    }
};

const getUserPosts = async (req, res) => {
    const userId = req.params.id;

    try {
        const userResponse = await axios.get(`https://jsonplaceholder.typicode.com/users/${userId}`);
        const user = userResponse.data;

        const postsResponse = await axios.get('https://jsonplaceholder.typicode.com/posts');
        const userPosts = postsResponse.data.filter(post => post.userId == userId);

        res.json({
            user: user,
            posts: userPosts
        });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des données.' });
    }
};

const uploadFile = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.status(200).json({ message: 'File uploaded successfully', file: req.file });
    });
};

const createPosts = async (req, res) => {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
        const posts = response.data.slice(0, 10);

        const filePath = path.join(__dirname, '../data.json');

        fs.writeFile(filePath, JSON.stringify(posts, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'écriture du fichier.' });
            }
            res.status(200).json({ message: 'Les posts ont été sauvegardés avec succès.', posts: posts });
        });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des posts.' });
    }
};

const getPosts = (req, res) => {
    const filePath = path.join(__dirname, '../data.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Une erreur s\'est produite lors de la lecture du fichier.' });
        }
        try {
            const posts = JSON.parse(data);
            res.status(200).json(posts);
        } catch (parseError) {
            res.status(500).json({ error: 'Erreur de parsing du fichier JSON.' });
        }
    });
};

const getPostById = (req, res) => {
    const postId = parseInt(req.params.postId);
    const filePath = path.join(__dirname, '../data.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Une erreur s\'est produite lors de la lecture du fichier.' });
        }
        try {
            const posts = JSON.parse(data);
            const post = posts.find(post => post.id === postId);
            if (post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ error: 'Post non trouvé.' });
            }
        } catch (parseError) {
            res.status(500).json({ error: 'Erreur de parsing du fichier JSON.' });
        }
    });
};

module.exports = {
    getUsers,
    getUserPosts,
    uploadFile,
    createPosts,
    getPosts,
    getPostById
};
