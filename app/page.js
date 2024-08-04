'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { firestore } from "@/firebase";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState('');
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async () => {
    if (!itemName || isNaN(itemCount)) {
      alert('Please enter valid name and count');
      return;
    }
    const docRef = doc(collection(firestore, 'inventory'), itemName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + parseInt(itemCount) });
    } else {
      await setDoc(docRef, { quantity: parseInt(itemCount) });
    }
    setItemName('');
    setItemCount('');
    handleClose();
    updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    await deleteDoc(docRef);
    updateInventory();
  };

  const editItem = async () => {
    if (!itemName || isNaN(itemCount)) {
      alert('Please enter valid name and count');
      return;
    }
    const docRef = doc(collection(firestore, 'inventory'), editing);
    await setDoc(docRef, { quantity: parseInt(itemCount) });
    setItemName('');
    setItemCount('');
    setEditing(null);
    handleClose();
    updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection='column' alignItems="center" gap={2}>
      <Modal open={open} onClose={handleClose}>
        <Box position="absolute" top="50%" left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{ transform: 'translate(-50%, -50%)' }}>
          <Typography variant="h6">{editing ? 'Edit Item' : 'Add Item'}</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant='outlined'
              fullWidth
              label="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              variant='outlined'
              fullWidth
              label="Item Count"
              type="number"
              value={itemCount}
              onChange={(e) => setItemCount(e.target.value)}
            />
            <Button
              variant='outlined'
              onClick={() => {
                if (editing) {
                  editItem();
                } else {
                  addItem();
                }
              }}>
              {editing ? 'Save' : 'Add'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Button variant="contained" onClick={() => {
        setItemName('');
        setItemCount('');
        setEditing(null);
        handleOpen();
      }}>Add New Item</Button>

      <TextField
        variant="outlined"
        label="Search Items"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ width: 400, mb: 2 }}
      />

      <Box border='1px solid #333' width="800px">
        <Box width="100%" height="100px" display="flex" bgcolor="#ADD8E6" alignItems="center" justifyContent="center">
          <Typography variant="h2" color='#333'>Inventory Items</Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {inventory
            .filter(({ id }) => id.toLowerCase().includes(search.toLowerCase()))
            .map(({ id, quantity }) => (
              <Box key={id} width="100%" minHeight="150px" display="flex"
                alignItems="center" justifyContent="space-between" bgcolor="#f0f0f0" padding={2}>
                <Stack direction="row" spacing={2} alignItems="center" flexGrow={1}>
                  <Typography variant="h3" color="#333" textAlign="center" flexGrow={1}>
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                  </Typography>
                  <Typography variant="h3" color="#333" textAlign="center" flexGrow={1}>
                    {quantity}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => {
                      setItemName(id);
                      setItemCount(quantity);
                      setEditing(id);
                      handleOpen();
                    }}>
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => removeItem(id)}>
                    Remove
                  </Button>
                </Stack>
              </Box>
            ))}
        </Stack>
      </Box>
    </Box>
  );
}
