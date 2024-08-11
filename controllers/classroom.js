const Classroom = require("../models/Classroom.js");
const User = require("../models/User.js");

exports.createClassroom = async (req, res) => {
    
    const { name, startTime, endTime, days, principalEmail, teacherId } = req.body;
    try {
        const principal = await User.findOne({ email: principalEmail, role: 'Principal' });
        if (!principal) {
            return res.status(403).json({ message: "Only a Principal can create a classroom" });
        }

        if (teacherId) {
            const teacher = await User.findById(teacherId);
            if (!teacher || teacher.role !== 'Teacher') {
                return res.status(404).json({ message: "Teacher not found" });
            }

            const existingClassroom = await Classroom.findOne({ teacher: teacherId });
            if (existingClassroom) {
                return res.status(400).json({ message: "This teacher is already assigned to another classroom" });
            }
        }

        const classroom = await Classroom.create({ name, startTime, endTime, days });

        if (teacherId) {
            classroom.teacher = teacherId;
            await classroom.save();

            const teacher = await User.findById(teacherId);
            teacher.classroom = classroom._id;
            await teacher.save();
        }

        res.status(201).json({ message: "Classroom created successfully", classroom });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};


exports.addStudents = async (req, res) => {
    const { classroomId, studentIds, requesterEmail } = req.body;

    try {
        const requester = await User.findOne({ email: requesterEmail });
        if (!requester || !['Principal', 'Teacher'].includes(requester.role)) {
            return res.status(403).json({ message: "Only a Principal or Teacher can assign students" });
        }

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) return res.status(404).json({ message: "Classroom not found" });

        for (let studentId of studentIds) {
            const student = await User.findById(studentId);
            if (student && student.role === 'Student') {
                student.classroom = classroomId;
                classroom.students.push(studentId);
                await student.save();
            }
        }

        await classroom.save();

        res.status(200).json({ message: "Students added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};



exports.getAllClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find()
            .populate('teacher', 'name email phoneNumber') 
            .populate('students', 'name email phoneNumber rollNumber'); 

        res.status(200).json({ classrooms });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.getStudentDetails = async (req,res)=>{
    try {
        const studentId = req.params.studentId;
        const student = await User.findById(studentId).select('name email phoneNumber rollNumber');
        const classrooms = await Classroom.find({ students: studentId }).select('name');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ student, classrooms });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getTeacherClassroom = async(req,res)=>{
    try {
        const { id } = req.params;
        
        const classrooms = await Classroom.find({ teacher: id }).populate('students');
        
        if (classrooms.length === 0) {
            return res.status(200).json({ message: 'No classroom has been assigned to you' });
        }

        let students = [];
        classrooms.forEach(classroom => {
            students = students.concat(classroom.students);
        });

        res.status(200).json({ classrooms, students });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the classrooms' });
    }
}


exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await User.findById(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.classroom) {
            await Classroom.updateMany(
                { students: id },
                { $pull: { students: id } }
            );
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({ message: 'Student Deleted Successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error Deleting Student' });
    }
};

exports.deleteTeacher = async(req,res)=>{
    try{
        const { id } = req.params;
        const teacher = User.findById(id)
        if(!teacher){
            return res.status(404).json({ message: 'Teacher not found' });
        }

        await Classroom.updateMany(
            { teacher: id }, 
            { $unset: { teacher: "" } }
        );

        await User.findByIdAndDelete(id);

        res.status(200).json({ message: 'Teacher Deleted Successfully' });
    }
    catch(error){
        res.status(500).json({ message: 'Error Deleting Teacher' });
    }
}

exports.getStudentInvolveClassroom = async(req,res)=>{
    try {
        const { studentId } = req.params;

        const classrooms = await Classroom.find({ students: studentId })
            .populate('teacher', 'name email phoneNumber')
            .populate('students', 'name email phoneNumber rollNumber');

        if (!classrooms || classrooms.length === 0) {
            return res.status(404).json({ message: "No classrooms found for this student" });
        }

        res.status(200).json({ classrooms });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}