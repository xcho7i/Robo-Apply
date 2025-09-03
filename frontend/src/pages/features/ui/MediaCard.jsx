import React, { useState } from 'react';
import { Box, Typography, Button, Grid, IconButton } from '@mui/material';
import {
  FaCircle,
  FaMusic,
  FaFileAlt,
  FaMagic,
  FaStar,
  FaCog,
  FaFolder,
} from 'react-icons/fa';
import { FaPlusCircle, FaSort, FaFilter } from 'react-icons/fa';
import { TbFilterSearch } from 'react-icons/tb';
import { MdSort } from 'react-icons/md';

import { FaCheckCircle } from 'react-icons/fa';
const MediaCard = () => {
  const [selectedNav, setSelectedNav] = useState('Media');
  const [selectedSidebar, setSelectedSidebar] = useState('Import');

  const navItems = [
    { name: 'Media', icon: <FaFolder /> },
    { name: 'Audio', icon: <FaMusic /> },
    { name: 'Text', icon: <FaFileAlt /> },
    { name: 'Effects', icon: <FaMagic /> },
    { name: 'Transition', icon: <FaStar /> },
    { name: 'Settings', icon: <FaCog /> },
  ];

  const sidebarItems = ['Local', 'Import', 'Library'];
  const images = [
    'Slide1.mp4',
    'Intern.png',
    'Slide11.png',
    'Product.jpg',
    'UserFlow.mp4',
    'Preview1.png',
    'Preview2.png',
    'MockupApps.jpg',
    'Ending.mp4',
  ];

  return (
    <div className="relative">
      {' '}
      <Box
        sx={{
          width: '500px',
          backgroundColor: '#140D15',
          borderRadius: '12px',
          boxShadow: '0px 0px 10px rgba(128, 128, 128, 0.2)',
          border:"2px solid #844ABE",
          overflow: 'hidden',
          zIndex: 20,
          position:'relative'
        }}
      >
        {/* Top Navigation Bar */}
        <Box
          sx={{
            display: 'flex',
            gap: '2.5rem',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {navItems.map((item) => (
            <Box
              key={item.name}
              onClick={() => setSelectedNav(item.name)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                color: selectedNav === item.name ? '#7530BA' : '#59565D',
                fontSize: '8px',
                transition: 'color 0.3s',
              }}
            >
              <Box sx={{ fontSize: '16px', marginBottom: '4px' }}>
                {item.icon}
              </Box>
              <Typography sx={{ fontSize: '13px' }}>{item.name}</Typography>
            </Box>
          ))}
        </Box>

        {/* Main Content Area */}
        <Box sx={{ display: 'flex' }}>
          {/* Sidebar */}
          <Box
            sx={{
              width: '20%',
              backgroundColor: '#140D15',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              gap: '8px',
            }}
          >
            {sidebarItems.map((item) => (
              <Button
                key={item}
                onClick={() => setSelectedSidebar(item)}
                sx={{
                  textTransform: 'none',
                  color: selectedSidebar === item ? 'white' : '#8F8F8F',
                  backgroundColor:
                    selectedSidebar === item ? '#6C43FF' : 'transparent',
                  fontWeight: selectedSidebar === item ? 'bold' : 'normal',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#6C43FF',
                    color: 'white',
                  },
                }}
              >
                {item}
              </Button>
            ))}
          </Box>

          {/* Content */}
          <Box
            sx={{
              flexGrow: 1,
              padding: '16px',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <Button
                startIcon={<FaPlusCircle />}
                sx={{
                  textTransform: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#7635B8',
                  backgroundColor: 'transparent',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  '&:hover': {
                    backgroundColor: '#6C43FF',
                    color: 'white',
                    borderColor: '#6C43FF',
                  },
                }}
              >
                <span className="text-[#B7B5BB]">Import</span>
              </Button>
              <Box sx={{ display: 'flex', gap: '8px' }}>
               
                <Button
                  startIcon={<MdSort />}
                  sx={{
                    textTransform: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#7635B8',
                    backgroundColor: 'transparent',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    '&:hover': {
                      backgroundColor: '#6C43FF',
                      color: 'white',
                      borderColor: '#6C43FF',
                    },
                  }}
                >
                  Sort
                </Button>

                {/* All Button */}
                <Button
                  startIcon={<TbFilterSearch />}
                  sx={{
                    textTransform: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#7635B8',
                    backgroundColor: 'transparent',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    '&:hover': {
                      backgroundColor: '#6C43FF',
                      color: 'white',
                      borderColor: '#6C43FF',
                    },
                  }}
                >
                  All
                </Button>
              </Box>
            </Box>

            {/* Image Grid */}
            <Grid container spacing={2}>
              {images.map((image, index) => (
                <Grid item xs={4} key={index}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100px',
                      backgroundColor: '#2B2B2B',
                      borderRadius: '8px',
                    }}
                  >
                    {/* Dot */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',

                        color: 'black',
                        fontSize: '8px',
                        height: '16px',
                        width: '16px',
                      }}
                    >
                      <FaCheckCircle style={{ fontSize: '16px' }} />
                    </Box>
                    {/* Image Name */}
                    <Typography
                      sx={{
                        color: '#8F8F8F',
                        fontSize: '12px',
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                      }}
                    >
                      {image}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
      {/* Faded bACKGROUND */}
      <Box
        sx={{
          width: '500px',
          backgroundColor: '#140D15',
          borderRadius: '12px',
          boxShadow: '0px 0px 10px rgba(128, 128, 128, 0.2)',
          overflow: 'hidden',
          opacity: 0.3,
          position: 'absolute',
          zIndex: 1,
          top:50,
          left:50
        }}
      >
        {/* Top Navigation Bar */}
        <Box
          sx={{
            display: 'flex',
            gap: '2.5rem',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {navItems.map((item) => (
            <Box
              key={item.name}
              onClick={() => setSelectedNav(item.name)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                color: selectedNav === item.name ? '#7530BA' : '#59565D',
                fontSize: '8px',
                transition: 'color 0.3s',
              }}
            >
              <Box sx={{ fontSize: '16px', marginBottom: '4px' }}>
                {item.icon}
              </Box>
              <Typography sx={{ fontSize: '13px' }}>{item.name}</Typography>
            </Box>
          ))}
        </Box>

        {/* Main Content Area */}
        <Box sx={{ display: 'flex' }}>
          {/* Sidebar */}
          <Box
            sx={{
              width: '20%',
              backgroundColor: '#140D15',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              gap: '8px',
            }}
          >
            {sidebarItems.map((item) => (
              <Button
                key={item}
                onClick={() => setSelectedSidebar(item)}
                sx={{
                  textTransform: 'none',
                  color: selectedSidebar === item ? 'white' : '#8F8F8F',
                  backgroundColor:
                    selectedSidebar === item ? '#6C43FF' : 'transparent',
                  fontWeight: selectedSidebar === item ? 'bold' : 'normal',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#6C43FF',
                    color: 'white',
                  },
                }}
              >
                {item}
              </Button>
            ))}
          </Box>

          {/* Content */}
          <Box
            sx={{
              flexGrow: 1,
              padding: '16px',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <Button
                startIcon={<FaPlusCircle />}
                sx={{
                  textTransform: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#7635B8',
                  backgroundColor: 'transparent',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  '&:hover': {
                    backgroundColor: '#6C43FF',
                    color: 'white',
                    borderColor: '#6C43FF',
                  },
                }}
              >
                <span className="text-[#B7B5BB]">Import</span>
              </Button>
              <Box sx={{ display: 'flex', gap: '8px' }}>
                {/* Sort Button */}
                <Button
                  startIcon={<MdSort />}
                  sx={{
                    textTransform: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#7635B8',
                    backgroundColor: 'transparent',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    '&:hover': {
                      backgroundColor: '#6C43FF',
                      color: 'white',
                      borderColor: '#6C43FF',
                    },
                  }}
                >
                  Sort
                </Button>

                {/* All Button */}
                <Button
                  startIcon={<TbFilterSearch />}
                  sx={{
                    textTransform: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#7635B8',
                    backgroundColor: 'transparent',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    '&:hover': {
                      backgroundColor: '#6C43FF',
                      color: 'white',
                      borderColor: '#6C43FF',
                    },
                  }}
                >
                  All
                </Button>
              </Box>
            </Box>

            {/* Image Grid */}
            <Grid container spacing={2}>
              {images.map((image, index) => (
                <Grid item xs={4} key={index}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100px',
                      backgroundColor: '#2B2B2B',
                      borderRadius: '8px',
                    }}
                  >
                    {/* Dot */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',

                        color: 'black',
                        fontSize: '8px',
                        height: '16px',
                        width: '16px',
                      }}
                    >
                      <FaCheckCircle style={{ fontSize: '16px' }} />
                    </Box>
                    {/* Image Name */}
                    <Typography
                      sx={{
                        color: '#8F8F8F',
                        fontSize: '12px',
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                      }}
                    >
                      {image}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default MediaCard;
