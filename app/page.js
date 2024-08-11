'use client';

import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, Stack, Button, Modal, TextField, Container, Grid, Paper, IconButton, MenuItem } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { auth, firestore } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Head from 'next/head';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: 'none',
  borderRadius: '12px',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 300,
};

const gradientBackground = {
  background: 'linear-gradient(135deg, #0c0d34 0%, #1c1d40 100%)',
  minHeight: '100vh',  // Ensure the container takes at least the full viewport height
  width: '100vw',
  color: 'white',
  padding: '20px',
  overflowY: 'auto',  // Enable vertical scrolling
  fontFamily: 'Roboto, sans-serif',
  display: 'flex',
  flexDirection: 'column',
};

const contentContainer = {
  overflowY: 'auto', // Enable scrolling for the content below the navbar
  height: 'calc(100vh - 20px)', // Calculate height based on the navbar's height
};

const navbarStyles = {
  backgroundColor: 'black',
  boxShadow: '#1A237E',
  padding: '5px 0',
  position: 'fixed',  // Make navbar fixed
  top: 0,  // Fix to the top
  left: 0,  // Align to the left
  right: 0,  // Align to the right
    // Ensure it stays above other elements
};

const toolbarStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const loginButtonStyles = {
  backgroundColor: '#673AB7',
  color: 'white',
  borderRadius: '20px',
  padding: '5px 20px',
  fontFamily: 'Roboto, sans-serif',
  '&:hover': {
    backgroundColor: '#5E35B1',
  },
};

const iconButtonStyles = {
  backgroundColor: '#1A237E',
  color: 'white',
  borderRadius: '50%',
  padding: '3px',
  marginLeft: '5px',
  marginRight: '5px',
  '&:hover': {
    backgroundColor: '#283593',
  },
  width: '24px',
  height: '24px',
};

const removeButtonStyles = {
  padding: '4px 12px',
  fontSize: '0.875rem',
  bgcolor: '#311B92',
  fontFamily: 'Roboto, sans-serif',
  '&:hover': { bgcolor: '#1A237E' },
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);  // Separate state for filtered items
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemUnit, setItemUnit] = useState('');
  const [itemImageURL, setItemImageURL] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);  // Total store value
  const [totalCategories, setTotalCategories] = useState(0);  // Number of categories
  const [editItem, setEditItem] = useState(null);  // State to track item being edited
  const router = useRouter();

  const updateInventory = async () => {
    if (!user) return;

    try {
      const snapshot = query(collection(firestore, `users/${user.uid}/inventory`));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      const categories = new Set(); // Track unique categories
      let totalValue = 0; // Track total store value
      docs.forEach((doc) => {
        const data = doc.data();
        inventoryList.push({ name: doc.id, ...data });
        categories.add(data.category);  // Add category to the set
        totalValue += data.price * data.quantity;  // Update total value
      });
      setInventory(inventoryList);
      setFilteredInventory(inventoryList);  // Set filteredInventory initially to the full list
      setTotalValue(totalValue);  // Set total store value
      setTotalCategories(categories.size);  // Set number of categories
    } catch (error) {
      console.error("Error fetching inventory: ", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          await updateInventory();
        } catch (error) {
          console.error("Error updating inventory: ", error);
        } finally {
          setLoading(false);  // Ensure loading is false even if there is an error
        }
      } else {
        router.push('/login');
        setLoading(false); // Stop loading if the user is not logged in
      }
    });

    return () => unsubscribe();
  }, []);

  const addItem = async () => {
    if (itemName.trim() === '' || itemPrice.trim() === '' || isNaN(parseFloat(itemPrice)) || itemQuantity.trim() === '' || isNaN(parseInt(itemQuantity)) || itemCategory.trim() === '' || itemUnit.trim() === '') return;

    try {
      const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), itemName);
      const docSnap = await getDoc(docRef);
      const price = parseFloat(itemPrice) || 0;
      const quantity = parseInt(itemQuantity) || 0;

      if (docSnap.exists()) {
        const { quantity: existingQuantity } = docSnap.data();
        await setDoc(docRef, { quantity: existingQuantity + quantity, price, category: itemCategory, unit: itemUnit, imageURL: itemImageURL }, { merge: true });
      } else {
        await setDoc(docRef, { quantity, price, category: itemCategory, unit: itemUnit, imageURL: itemImageURL });
      }
      setItemName('');
      setItemPrice('');
      setItemQuantity('');
      setItemCategory('');
      setItemUnit('');
      setItemImageURL('');
      await updateInventory();
      handleClose();
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const editExistingItem = async () => {
    if (!editItem || itemName.trim() === '' || isNaN(parseFloat(itemPrice)) || itemQuantity.trim() === '' || isNaN(parseInt(itemQuantity))) {
        return;
    }

    try {
        const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), editItem.name);
        await setDoc(docRef, {
            price: parseFloat(itemPrice),
            quantity: parseInt(itemQuantity),
            category: itemCategory,
            unit: itemUnit,
            imageURL: itemImageURL
        }, { merge: true });
        await updateInventory();
        handleClose();
    } catch (error) {
        console.error("Error editing item: ", error);
    }
};


  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), item);
      await deleteDoc(docRef);
      await updateInventory();
    } catch (error) {
      console.error("Error removing item: ", error);
    }
  };

  const incrementQuantity = async (item) => {
    try {
      const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity, price, category, unit, imageURL } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1, price, category, unit, imageURL }, { merge: true });
        await updateInventory();
      }
    } catch (error) {
      console.error("Error incrementing quantity: ", error);
    }
  };

  const decrementQuantity = async (item) => {
    try {
      const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity, price, category, unit, imageURL } = docSnap.data();
        if (quantity > 1) {
          await setDoc(docRef, { quantity: quantity - 1, price, category, unit, imageURL }, { merge: true });
          await updateInventory();
        }
      }
    } catch (error) {
      console.error("Error decrementing quantity: ", error);
    }
  };

  const calculateTotal = () => {
    return inventory.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditItem(null); // Reset edit item when modal is closed
  };

  const handleEditOpen = (itemName) => {
    const itemToEdit = inventory.find(item => item.name === itemName);
    setItemName(itemToEdit.name);
    setItemPrice(itemToEdit.price);
    setItemQuantity(itemToEdit.quantity);
    setItemCategory(itemToEdit.category);
    setItemUnit(itemToEdit.unit);
    setItemImageURL(itemToEdit.imageURL);
    setEditItem(itemToEdit);
    setOpen(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = inventory.filter(item => item.name.toLowerCase().includes(value));
    setFilteredInventory(filtered);
  };

  if (loading) {
    return <Box sx={gradientBackground}>Loading...</Box>;
  }

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>
      <AppBar position="static" sx={navbarStyles}>
        <Toolbar sx={toolbarStyles}>
          <Typography
            variant="h6"
            component="div"
            sx={{ color: 'white', cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            {user ? `Welcome, ${user.displayName}` : 'Welcome'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button variant="contained" sx={loginButtonStyles} onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={contentContainer}>
        {/* Dashboard Section */}
        <Container sx={{ mt: 4, maxWidth: '100%', overflow: 'hidden' }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" sx={{ color: '#ffffff', fontFamily: 'Roboto, sans-serif', mb: 2 }}>
              Inventory Overview
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ padding: 2, bgcolor: '#4e2a8e', color: 'white', borderRadius: '12px' }}>
                  <Typography variant="h6" fontFamily="Roboto, sans-serif">
                    Total Products
                  </Typography>
                  <Typography variant="h3" fontFamily="Roboto, sans-serif">
                    {inventory.length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ padding: 2, bgcolor: '#4e2a8e', color: 'white', borderRadius: '12px' }}>
                  <Typography variant="h6" fontFamily="Roboto, sans-serif">
                    Total Store Value
                  </Typography>
                  <Typography variant="h3" fontFamily="Roboto, sans-serif">
                    ${totalValue.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ padding: 2, bgcolor: '#4e2a8e', color: 'white', borderRadius: '12px' }}>
                  <Typography variant="h6" fontFamily="Roboto, sans-serif">
                    All Categories
                  </Typography>
                  <Typography variant="h3" fontFamily="Roboto, sans-serif">
                    {totalCategories}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>

        <Container sx={{ mt: 4, maxWidth: '100%', overflow: 'hidden' }}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={5}>
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Box textAlign="center">
                  <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: '#3E50CC', fontFamily: 'Roboto, sans-serif' }}>
                    Inventory Pro
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mt: 2, fontFamily: 'Roboto, sans-serif' }}>
                    Efficiently manage and track your inventory with our robust system, ensuring your stock levels are always accurate and up-to-date.
                  </Typography>
                  <Button variant="contained" sx={{ mt: 4, bgcolor: '#021FAF', '&:hover': { bgcolor: '#031F5F' }, fontFamily: 'Roboto, sans-serif' }} onClick={handleOpen}>
                    Add New Item
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={7}>
              <TextField
                label="Search Inventory"
                variant="outlined"
                fullWidth
                sx={{ bgcolor: 'white', borderRadius: '8px', marginBottom: 2 }}
                onChange={handleSearch}
              />
              <Paper elevation={3} sx={{ padding: 3, bgcolor: '#1c1d40', borderRadius: '12px', height: '400px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <Box
                  height="60px"
                  bgcolor={'#3E50CC'}
                  display={'flex'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  borderRadius={1}
                  mb={2}
                >
                  <Typography variant={'h4'} color={'#FFFFFF'} textAlign={'center'} fontWeight="bold">
                    Inventory Items
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                  <Stack spacing={2}>
                    {filteredInventory.map(({ name, quantity, price, category, unit, imageURL }) => (
                      <Box
                        key={name}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        bgcolor="#283593"
                        paddingX={2}
                        paddingY={1}
                        borderRadius={2}
                        boxShadow={2}
                      >
                        <Box display="flex" flexDirection="column" flex={1}>
                          <Typography variant="h6" color="white" fontFamily="Roboto, sans-serif">
                            {name.charAt(0).toUpperCase() + name.slice(1)}
                          </Typography>
                          <Typography variant="body2" color="white" fontFamily="Roboto, sans-serif">
                            {category} - {unit}
                          </Typography>
                        </Box>
                        <Typography variant="h6" color="white" flex={1} textAlign="center" fontFamily="Roboto, sans-serif">
                          ${price || 0}
                        </Typography>
                        <Box display="flex" alignItems="center" flex={1} justifyContent="center">
                          <IconButton sx={iconButtonStyles} onClick={() => decrementQuantity(name)}>
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography variant="h6" color="white" mx={2} fontFamily="Roboto, sans-serif">
                            {quantity}
                          </Typography>
                          <IconButton sx={iconButtonStyles} onClick={() => incrementQuantity(name)}>
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginRight: 2 }}>
                          <img src={imageURL} alt={name} style={{ width: '50px', height: '50px', borderRadius: '8px' }} />
                        </Box>
                        <Box>
                          <Button variant="contained" sx={removeButtonStyles} onClick={() => removeItem(name)}>
                            Remove
                          </Button>
                          <Button variant="contained" sx={{ ...removeButtonStyles, ml: 1 }} onClick={() => handleEditOpen(name)}>
                            Edit
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
                {/*
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  bgcolor="#283593"
                  paddingX={2}
                  paddingY={1}
                  borderRadius={2}
                  boxShadow={2}
                  mt={2}
                >
                  <Typography variant="h6" color="white" fontFamily="Roboto, sans-serif">
                    Total
                  </Typography>
                  <Typography variant="h6" color="white" textAlign="center" fontFamily="Roboto, sans-serif">
                    ${calculateTotal()}
                  </Typography>
                </Box> */}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" color="#555" fontFamily="Roboto, sans-serif">
            {editItem ? 'Edit Product' : 'Add New Product'}
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{ bgcolor: 'white', borderRadius: '8px' }}
              disabled={!!editItem}  // Disable editing name during edit
            />
            <TextField
              id="outlined-category"
              label="Category"
              variant="outlined"
              fullWidth
              select
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              sx={{ bgcolor: 'white', borderRadius: '8px' }}
            >
              <MenuItem value="Fruits">Fruits</MenuItem>
              <MenuItem value="Vegetables">Vegetables</MenuItem>
              <MenuItem value="Bakery Products">Bakery Products</MenuItem>
              <MenuItem value="Dairy Products">Dairy Products</MenuItem>
              <MenuItem value="Cleaning Products">Cleaning Products</MenuItem>
              <MenuItem value="Household Items">Household Items</MenuItem>
            </TextField>
            <TextField
              id="outlined-price"
              label="Price ($)"
              variant="outlined"
              fullWidth
              type="number"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              sx={{ bgcolor: 'white', borderRadius: '8px' }}
            />
            <TextField
              id="outlined-quantity"
              label="Quantity"
              variant="outlined"
              fullWidth
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
              sx={{ bgcolor: 'white', borderRadius: '8px' }}
            />
            <TextField
              id="outlined-unit"
              label="Unit"
              variant="outlined"
              fullWidth
              select
              value={itemUnit}
              onChange={(e) => setItemUnit(e.target.value)}
              sx={{ bgcolor: 'white', borderRadius: '8px' }}
            >
              <MenuItem value="Kilogram (kg)">Kilogram (kg)</MenuItem>
              <MenuItem value="Gram (g)">Gram (g)</MenuItem>
              <MenuItem value="Each (ea)">Each (ea)</MenuItem>
            </TextField>
            <TextField
              id="outlined-image-url"
              label="Image URL"
              variant="outlined"
              fullWidth
              value={itemImageURL}
              onChange={(e) => setItemImageURL(e.target.value)}
              sx={{ bgcolor: 'white', borderRadius: '8px' }}
            />
            <Button
              variant="contained"
              sx={{ bgcolor: '#673AB7', '&:hover': { bgcolor: '#5E35B1' }, fontFamily: 'Roboto, sans-serif' }}
              onClick={editItem ? editExistingItem : addItem}
            >
              {editItem ? 'Save Changes' : 'Add Product'}
            </Button>
            <Button
              variant="text"
              onClick={handleClose}
              sx={{ color: '#555', fontFamily:"Roboto, sans-serif" }}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}
