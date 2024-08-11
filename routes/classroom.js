const express = require('express');
const { createClassroom , addStudents, getAllClassrooms, getStudentDetails, getTeacherClassroom, deleteStudent, deleteTeacher, getStudentInvolveClassroom} = require('../controllers/classroom.js');
const router = express.Router();
;

router.post('/create', createClassroom);

router.post('/add-students', addStudents);

router.get('/getAllClassrooms',getAllClassrooms)

router.get('/getStudentDetails/:studentId',getStudentDetails)

router.get('/getTeacherClassroom/:id',getTeacherClassroom)

router.delete('/deleteStudent/:id', deleteStudent);

router.delete('/deleteTeacher/:id', deleteTeacher);

router.get('/getStudentInvolveClassroom/:studentId', getStudentInvolveClassroom)

module.exports = router;
