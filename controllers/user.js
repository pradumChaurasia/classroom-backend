const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.createPrincipal = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if the Principal account already exists
        let principal = await User.findOne({ email });
        if (principal) {
            return res.status(400).json({ message: 'Principal account already exists' });
        }

        // Ensure the role is 'Principal'
        if (role !== 'Principal') {
            return res.status(400).json({ message: 'Role must be Principal' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create the Principal account
        const newPrincipal = await User.create({ name, email, password: hashedPassword, role });

        res.status(201).json({ message: 'Principal account created successfully', newPrincipal });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, creatorEmail } = req.body;

        // Check if the user trying to create a new account exists
        const creator = await User.findOne({ email: creatorEmail });
        if (!creator) {
            return res.status(400).json({ message: 'Invalid creator credentials' });
        }

        // Check if the user trying to create an account has the right role
        if (role === 'Teacher' && creator.role !== 'Principal') {
            return res.status(403).json({ message: 'Only Principals can create Teacher accounts' });
        }

        if (role === 'Student' && !['Principal', 'Teacher'].includes(creator.role)) {
            return res.status(403).json({ message: 'Only Principals and Teachers can create Student accounts' });
        }

        // Check if the email is already registered
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a new user
        const newUser = await User.create({ name, email, password: hashedPassword, role });

        res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        res.status(200).json({ user, token });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getUsers = async(req,res)=>{
    try {
        const teachers = await User.find({ role: 'Teacher' });
        const students = await User.find({ role: 'Student' });

        // Check if there are no teachers or students
        const message = {};
        if (teachers.length === 0) {
            message.teachers = 'No teachers available';
        }
        if (students.length === 0) {
            message.students = 'No students available';
        }

        // If both are empty, return a specific message
        if (teachers.length === 0 && students.length === 0) {
            return res.status(200).json({ message: 'No teachers or students available' });
        }

        res.status(200).json({ teachers, students, message });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

exports.updateUser = async(req,res)=>{
    try{
        const { id } = req.params;
        const { name, email } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { name, email },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User Updated Successfully', updatedUser });
    }
    catch(error){
        console.error(error.message);
        res.status(500).send('Server error');
    }
}
