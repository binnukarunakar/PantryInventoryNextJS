'use client'
import { useState, useEffect } from "react";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";
import { Box, Button, Modal, Stack, TextField, Typography, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search'; // For search icon
import { firestore } from "@/firebase";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState(1);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch inventory from Firestore
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
    console.log(inventoryList);
  };

  // Add new item to Firestore
  const addItem = async (item, count) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + count });
    } else {
      await setDoc(docRef, { quantity: count });
    }
    updateInventory(); // Refresh the inventory list
  };

  // Remove item from Firestore
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    updateInventory(); // Refresh the inventory list
  };

  // Edit item count in Firestore
  const editItemCount = async (item, count) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    await setDoc(docRef, { quantity: count });
    updateInventory(); // Refresh the inventory list
  };

  // Filter items based on search query
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const filtered = inventory.filter(item => 
      item.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredInventory(filtered);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setItemName('');
    setItemCount(1);
    setEditItem(null);
    setOpen(false);
  };

  const handleAddItem = () => {
    if (itemName.trim() !== '') {
      addItem(itemName, itemCount);
      handleClose();
    }
  };

  const handleEditItem = () => {
    if (editItem && itemCount > 0) {
      editItemCount(editItem.name, itemCount);
      handleClose();
    }
  };

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection='column' justifyContent="center" alignItems="center" gap={2}>
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
          sx={{
            transform: 'translate(-50%, -50%)'
          }}>
          <Typography variant="h6">{editItem ? "Edit Item" : "Add Item"}</Typography>
          <Stack width="100%" direction="column" spacing={2}>
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
              type="number"
              label="Item Count"
              value={itemCount}
              onChange={(e) => setItemCount(parseInt(e.target.value, 10) || 1)}
            />
            <Stack direction="row" spacing={2}>
              <Button 
                variant='outlined'
                onClick={() => {
                  if (editItem) {
                    handleEditItem();
                  } else {
                    handleAddItem();
                  }
                }}>
                {editItem ? "Save" : "Add"}
              </Button>
              <Button 
                variant='outlined'
                onClick={handleClose}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
      <Box width="100%" p={2} display="flex" justifyContent="center">
        <TextField
          variant='outlined'
          placeholder="Search items..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Button variant="contained" onClick={() => {
        setEditItem(null);
        setItemName('');
        setItemCount(1);
        handleOpen();
      }}>Add New Item</Button>
      <Box border='1px solid #333'>
        <Box width="800px" height="100px" display="flex" bgcolor="#ADD8E6" alignItems="center" justifyContent="center">
          <Typography variant="h2" color='#333'>Inventory Items</Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {filteredInventory.map(({ name, quantity }) => (
            <Box key={name} width="100%" minHeight="150px" display="flex"
              alignItems="center" justifyContent="space-between" bgcolor="#f0f0f0" padding={3}>
              <Stack direction="row" spacing={1} alignItems="center" width="100%" justifyContent="space-between">
                <Typography variant="h3" color="#333" noWrap>{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                <Typography variant="h3" color="#333" noWrap>{quantity}</Typography>
              </Stack>
              {quantity > 0 && (
                <Stack direction="row" spacing={1}>
                  <Button 
                    variant="outlined"
                    onClick={() => {
                      setItemName(name);
                      setItemCount(quantity);
                      setEditItem({ name });
                      handleOpen();
                    }}>
                    Edit
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={() => removeItem(name)}>
                    Remove
                  </Button>
                </Stack>
              )}
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
