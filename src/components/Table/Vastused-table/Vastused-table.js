import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import {useEffect, useMemo, useState} from "react";
import EditRoundedIcon from '@mui/icons-material/EditRounded';

import AddHighlight from "../../Dialog/Add-Highlight/Add-highlight";

import "./Vastused-table.css"
import {setGlobalState, useGlobalState} from "../../../StateAuth";
import {getVastused} from "../../../Services/Vastused/Vastused-services";
import SnackBar from "../../Snackbar/Snackbar";
import Button from "@mui/material/Button";
import io from "socket.io-client"
import FormControl from "@mui/material/FormControl";
import {InputLabel, Select} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

const socket = io("https://employee-webserver.herokuapp.com/", {
    forceNew: false,
    transports: ['websocket'],
    upgrade: false
})

const columns = [
    { id: 'id', label: 'ID' },
    { id: 'user_id', label: 'User id' },
    { id: 'category_name', label: 'Category name' },
    { id: 'sub_category_name', label: 'Sub category name' },
    { id: 'question_title', label: 'Question title' },
    { id: 'question_description', label: 'Question description' },
    { id: 'question_date', label: 'Question date' },
    { id: 'answer_title', label: 'Answer title'},
    { id: 'answer_description', label: 'Answer description' },
    { id: 'source', label: 'Source' },
    {id: 'add_highlight', label: "Add highlight"}

];


export default function VastusedTable() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [questionTitle, setQuestionTitle] = useState("");
    const [questionDescription, setQuestionDescription] = useState("");
    const [answerDescription, setAnswerDescription] = useState("");
    const [id, setId] = useState("");
    const [refreshVastused] = useGlobalState("refreshVastused")
    const [openSnackBar] = useGlobalState("showSnackBar")
    const [selectedCategory, setSelectedCategory] = useState();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const [state, setState] = useState([]);

    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = (question_title, question_description, answer_description, id) => {
        setIsOpen(!isOpen);
        setQuestionTitle(question_title)
        setQuestionDescription(question_description)
        setAnswerDescription(answer_description)
        setId(id)
    };

    const start = () => {
        socket.emit("start-client", "start test")
    }
    const stop = () => {
        socket.emit("stop-client", "stop test")
    }

    const fetchData = () => {
        getVastused().then(res => {
            setState(res.data)
        }).catch(err => {
            localStorage.removeItem("currentUser")
            localStorage.removeItem("initialTime")
        })
    }
    const [age, setAge] = React.useState('');

    useEffect(() => {
        if (localStorage.getItem("currentUser")){
            setGlobalState("isAuth", true)
        }else {
            setGlobalState("isAuth", false)
        }

        fetchData()
        socket.on("test event", data => {
            console.log(data)
        })


    }, [])

    useEffect(() =>{
        if (refreshVastused){
            getVastused().then(res => {
                setState(res.data)
                setGlobalState("refreshVastused", false)
            })
        }
    })



    function handleCategoryChange(event) {
        setSelectedCategory(event.target.value);
    }

    function getFilteredList(){
        if (!selectedCategory){
            return state
        }
        return state.filter((item) => item.source === selectedCategory)
    }

    var filteredList = useMemo(getFilteredList, [selectedCategory, state])




    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Button variant="contained" style={{margin: "20px"}} color="success" onClick={start}>Start</Button>
            <Button variant="contained" style={{margin: "20px"}} color="error" onClick={stop}>Stop</Button>
            <AddHighlight
                isDialogOpened={isOpen}
                handleCloseDialog={() => setIsOpen(false)}
                question_title={questionTitle}
                question_description={questionDescription}
                answer_description={answerDescription}
                id={id}
            />
            <SnackBar
                isSnackbarOpened={openSnackBar}
                handleCloseSnackbar={() => setGlobalState("showSnackBar", false)}
                message="Data was successful highlighted"
            />

            <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}>
                                    {column.label === "Source" ? (
                                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                                            <InputLabel id="demo-simple-select-standard-label">{column.label}</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-standard-label"
                                                id="demo-simple-select-standard"
                                                value={selectedCategory || ""}
                                                onChange={handleCategoryChange}
                                                label="Source">
                                                <MenuItem value="">All</MenuItem>
                                                <MenuItem value="vastused.ee">vastused.ee</MenuItem>
                                                <MenuItem value="infolex.lt">infolex.lt</MenuItem>
                                            </Select>
                                        </FormControl>
                                    ):(
                                        <div>{column.label}</div>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => (
                            <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">
                                    {row.id}
                                </TableCell>
                                <TableCell align="left">{row.user_id}</TableCell>
                                <TableCell align="left">{row.category_name}</TableCell>
                                <TableCell align="left">{row.sub_category_name}</TableCell>
                                <TableCell align="left" dangerouslySetInnerHTML={{__html: row.question_title}}/>

                                <TableCell align="left" dangerouslySetInnerHTML={{__html: row.question_description}}/>
                                <TableCell align="left">{row.question_date}</TableCell>
                                <TableCell align="left">{JSON.stringify(row.answer_title, null, 2)}</TableCell>
                                <TableCell align="left" dangerouslySetInnerHTML={{__html: row.answer_description}}/>

                                <TableCell align="left">{row.source}</TableCell>

                                <TableCell align="left">
                                    <EditRoundedIcon onClick={() =>
                                        handleOpen(row.question_title, row.question_description, row.answer_description, row.id)}
                                                     className="edit-button" color="secondary"/>
                                </TableCell>
                            </TableRow>

                        ))}

                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={filteredList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>

    );
}
