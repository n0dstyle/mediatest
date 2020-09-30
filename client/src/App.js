import React, { useState, useEffect } from 'react';
import './App.css';
import DeleteIcon from '@material-ui/icons/Delete';
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import StorageIcon from '@material-ui/icons/Storage'
import Grid from '@material-ui/core/Grid';

function App() {
    const [list, setList] = useState([]);
    const [totalGenerate, setTotalGenerate] = useState(0)
    const [totalRecive, setTotalRecive] = useState(0)

    const getData = () => {
        fetch('http://localhost:3001/list')
            .then(res => res.json())
            .then(data => {
                let totalG = 0
                let totalR = 0
                for(let nod of data){
                    totalG += nod.generateCount
                    totalR += nod.reciveCount
                }
                setTotalGenerate(totalG)
                setTotalRecive(totalR)
                setList(data)
            })
    }

    useEffect( () => {
        getData()
    }, []);


    const deleteNode = (pid) => {
        fetch(`http://localhost:3001/delete?node=${pid}`)
            .then(res => getData())
    }

    return (
        <div className="App">
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Typography variant="h6">
                        Nods list
                    </Typography>
                    <div>Total generated msg {totalGenerate}</div>
                    <div>Total recevied msg {totalRecive}</div>
                    <div>
                        <List>
                            {list ? list.map(node => (
                                   <ListItem key={node.pid}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <StorageIcon color={node.killed ? 'secondary' : 'primary'}/>
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`Node ${node.pid}`}
                                        secondary={`State ${node.state} Generate: ${node.generateCount} Recive ${node.reciveCount}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => deleteNode(node.pid)} edge="end" aria-label="delete">
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            )) : null}


                        </List>
                    </div>
                </Grid>
            </Grid>
        </div>

    );
}

export default App;
