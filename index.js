require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');  // Import the cors package

const app = express();

// Use cors middleware to allow requests from specific origins
app.use(cors({
    origin: 'http://localhost:3000',  // Allow requests from this origin
    methods: ['GET', 'POST'],         // Allow specific methods
    allowedHeaders: ['Content-Type']  // Allow specific headers
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Database connection error:', err));

// Define a schema and model for user data
const userSchema = new mongoose.Schema({
    user_id: String,
    email: String,
    roll_number: String,
    numbers: [String],
    alphabets: [String],
    highest_lowercase_alphabet: [String],
});

const User = mongoose.model('User', userSchema);

// Health check route
app.get('/bfhl', (req, res) => {
    res.status(200).json({
        operation_code: 1
    });
});

// Process data route
app.post('/bfhl', async (req, res) => {
    try {
        const { data } = req.body;

        // Separate numbers and alphabets
        const numbers = data.filter(item => !isNaN(item));
        const alphabets = data.filter(item => /^[a-zA-Z]+$/.test(item));
        const lowercaseAlphabets = alphabets.filter(item => /^[a-z]+$/.test(item));
        
        // Determine the highest lowercase alphabet
        const highestLowercaseAlphabet = lowercaseAlphabets.length > 0
            ? [lowercaseAlphabets.sort().pop()]
            : [];

        // Create and save the user data
        const user = new User({
            user_id: "john_doe_17091999",
            email: "john@xyz.com",
            roll_number: "ABCD123",
            numbers,
            alphabets,
            highest_lowercase_alphabet: highestLowercaseAlphabet,
        });

        await user.save();

        // Return the processed data as a response
        res.status(200).json({
            is_success: true,
            user_id: user.user_id,
            email: user.email,
            roll_number: user.roll_number,
            numbers: user.numbers,
            alphabets: user.alphabets,
            highest_lowercase_alphabet: user.highest_lowercase_alphabet,
        });
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({
            is_success: false,
            error: 'An error occurred while processing the request.',
        });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
