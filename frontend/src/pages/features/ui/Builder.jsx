import React, { useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  Select,
  MenuItem,
  IconButton,
  Input,
} from '@mui/material';


import { FaChevronUp, FaChevronDown, FaRedo } from 'react-icons/fa';
const MediaCard = () => {
  const [scale, setScale] = useState(100);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [blendMode, setBlendMode] = useState('Normal');
  const [selectedTab, setSelectedTab] = useState('Basic');

  const tabs = ['Basic', 'Cutout', 'Mask', 'Enhance'];

  const handleReset = (field) => {
    switch (field) {
      case 'scale':
        setScale(100);
        break;
      case 'position':
        setPositionX(0);
        setPositionY(0);
        break;
      case 'rotate':
        setRotate(0);
        break;
      case 'opacity':
        setOpacity(100);
        break;
      default:
        break;
    }
  };

  return (
    <div className='relative'>
    <Box
      sx={{
        width: '500px',
        backgroundColor: '#140D15',
          border:"2px solid #844ABE",
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.5)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
         zIndex: 20,
          position:'relative'
      }}
    >
      {/* Tabs */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '8px',
        }}
      >
        {tabs.map((tab) => (
          <Typography
            key={tab}
            onClick={() => setSelectedTab(tab)}
            sx={{
              cursor: 'pointer',
              color: selectedTab === tab ? '#844ABE' : '#8F8F8F',
              fontWeight: selectedTab === tab ? 'bold' : 'normal',
              fontSize: '16px',
              transition: 'color 0.3s',
            }}
          >
            {tab}
          </Typography>
        ))}
      </Box>

      {/* Position & Size Section */}
      <Box
        sx={{
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '16px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold', flexGrow: 1 }}>
            Position & Size
          </Typography>
          <IconButton onClick={() => handleReset('scale')} sx={{ color: 'grey' }}>
            <FaRedo fontSize={15}/>
          </IconButton>
        </Box>

        {/* Scale */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <Typography sx={{ flexGrow: 1 }}>Scale</Typography>
          <Slider
            value={scale}
            onChange={(e, val) => setScale(val)}
            min={0}
            max={200}
            step={1}
            sx={{ color: '#844ABE', flexGrow: 3, marginLeft: '16px' }}
          />
          <Input
            value={`${scale}%`}
            readOnly
            disableUnderline
            sx={{
              width: '60px',
              backgroundColor: '#1F1F1F',
              textAlign: 'center',
              borderRadius: '8px',
              color: 'white',
              marginLeft: '16px',
              fontSize: '14px',
            }}
          />
        </Box>

        {/* Position */}
        <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
          <Typography >Position</Typography>
          <Input
            value={positionX}
            onChange={(e) => setPositionX(Number(e.target.value))}
            disableUnderline
            sx={{
              width: '80px',
              backgroundColor: '#1F1F1F',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              padding: '4px 8px',
              textAlign: 'center',
            }}
            endAdornment={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '4px',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleArrowClick('positionX', 1)}
                  sx={{ color: '#844ABE', padding: '4px' }}
                >
                  <FaChevronUp color="grey" fontSize={10}/>
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleArrowClick('positionX', -1)}
                  sx={{ color: '#844ABE', padding: '4px' }}
                >
                  <FaChevronDown color="grey" fontSize={10}/>
                </IconButton>
              </Box>
            }
          />
          <Typography>X</Typography>
          <Input
            value={positionY}
            onChange={(e) => setPositionX(Number(e.target.value))}
            disableUnderline
            sx={{
              width: '80px',
              backgroundColor: '#1F1F1F',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              padding: '4px 8px',
              textAlign: 'center',
            }}
            endAdornment={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '4px',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleArrowClick('positionY', 1)}
                  sx={{ color: '#844ABE', padding: '4px' }}
                >
                  <FaChevronUp color="grey" fontSize={10}/>
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleArrowClick('positionY', -1)}
                  sx={{ color: '#844ABE', padding: '4px' }}
                >
                  <FaChevronDown color="grey" fontSize={10}/>
                </IconButton>
              </Box>
            }
          />
          <Typography>Y</Typography>
        </Box>

        {/* Rotate */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <Typography sx={{ flexGrow: 1 }}>Rotate</Typography>
          <Slider
            value={rotate}
            onChange={(e, val) => setRotate(val)}
            min={-180}
            max={180}
            step={1}
            sx={{ color: '#844ABE', flexGrow: 3, marginLeft: '16px' }}
          />
          <Input
            value={`${rotate}°`}
            readOnly
            disableUnderline
            sx={{
              width: '60px',
              backgroundColor: '#1F1F1F',
              textAlign: 'center',
              borderRadius: '8px',
              color: 'white',
              marginLeft: '16px',
              fontSize: '14px',
            }}
          />
        </Box>
      </Box>

      {/* Blend Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold', flexGrow: 1 }}>
            Blend
          </Typography>
          <IconButton onClick={() => handleReset('opacity')} sx={{ color: 'grey' }}>
          <FaRedo fontSize={15}/>
          </IconButton>
        </Box>

        {/* Mode */}
        <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '2rem',
  }}
>
  <Typography>Mode</Typography>
  <Select
    value={blendMode}
    onChange={(e) => setBlendMode(e.target.value)}
    displayEmpty
    IconComponent={() => <FaChevronDown />}
    sx={{
      fontSize: '14px',
      width: '100%', // Adjust width as needed
      height: '40px',
      backgroundColor: '#1F1F1F',
      color: 'white',
      borderRadius: '8px',
      paddingRight: '28px', // Add padding for the icon
      '.MuiSelect-icon': {
        color: 'white',
        right: '8px', // Position the icon properly
        pointerEvents: 'none', // Prevent the icon from blocking clicks
      },
    }}
  >
    <MenuItem value="Normal" sx={{ fontSize: '10px' }}>
      Normal
    </MenuItem>
    <MenuItem value="Multiply" sx={{ fontSize: '10px' }}>
      Multiply
    </MenuItem>
    <MenuItem value="Screen" sx={{ fontSize: '10px' }}>
      Screen
    </MenuItem>
  </Select>
</Box>

        {/* Opacity */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <Typography sx={{ flexGrow: 1 }}>Opacity</Typography>
          <Slider
            value={opacity}
            onChange={(e, val) => setOpacity(val)}
            min={0}
            max={100}
            step={1}
            sx={{ color: '#844ABE', flexGrow: 3, marginLeft: '16px' }}
          />
          <Input
            value={`${opacity}%`}
            readOnly
            disableUnderline
            sx={{
              width: '60px',
              backgroundColor: '#1F1F1F',
              textAlign: 'center',
              borderRadius: '8px',
              color: 'white',
              marginLeft: '16px',
              fontSize: '14px',
            }}
          />
        </Box>
      </Box>
    </Box>


    <Box
      sx={{
        width: '500px',
        backgroundColor: '#140D15',
          border:"2px solid #844ABE",
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.5)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        opacity: 0.3,
        position: 'absolute',
        zIndex: 1,
        top:50,
        left:50
      }}
    >
      {/* Tabs */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '8px',
        }}
      >
        {tabs.map((tab) => (
          <Typography
            key={tab}
            onClick={() => setSelectedTab(tab)}
            sx={{
              cursor: 'pointer',
              color: selectedTab === tab ? '#844ABE' : '#8F8F8F',
              fontWeight: selectedTab === tab ? 'bold' : 'normal',
              fontSize: '16px',
              transition: 'color 0.3s',
            }}
          >
            {tab}
          </Typography>
        ))}
      </Box>

      {/* Position & Size Section */}
      <Box
        sx={{
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '16px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold', flexGrow: 1 }}>
            Position & Size
          </Typography>
          <IconButton onClick={() => handleReset('scale')} sx={{ color: 'grey' }}>
            <FaRedo fontSize={15}/>
          </IconButton>
        </Box>

        {/* Scale */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <Typography sx={{ flexGrow: 1 }}>Scale</Typography>
          <Slider
            value={scale}
            onChange={(e, val) => setScale(val)}
            min={0}
            max={200}
            step={1}
            sx={{ color: '#844ABE', flexGrow: 3, marginLeft: '16px' }}
          />
          <Input
            value={`${scale}%`}
            readOnly
            disableUnderline
            sx={{
              width: '60px',
              backgroundColor: '#1F1F1F',
              textAlign: 'center',
              borderRadius: '8px',
              color: 'white',
              marginLeft: '16px',
              fontSize: '14px',
            }}
          />
        </Box>

        {/* Position */}
        <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
          <Typography >Position</Typography>
          <Input
            value={positionX}
            onChange={(e) => setPositionX(Number(e.target.value))}
            disableUnderline
            sx={{
              width: '80px',
              backgroundColor: '#1F1F1F',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              padding: '4px 8px',
              textAlign: 'center',
            }}
            endAdornment={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '4px',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleArrowClick('positionX', 1)}
                  sx={{ color: '#844ABE', padding: '4px' }}
                >
                  <FaChevronUp color="grey" fontSize={10}/>
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleArrowClick('positionX', -1)}
                  sx={{ color: '#844ABE', padding: '4px' }}
                >
                  <FaChevronDown color="grey" fontSize={10}/>
                </IconButton>
              </Box>
            }
          />
          <Typography>X</Typography>
          <Input
            value={positionY}
            onChange={(e) => setPositionX(Number(e.target.value))}
            disableUnderline
            sx={{
              width: '80px',
              backgroundColor: '#1F1F1F',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              padding: '4px 8px',
              textAlign: 'center',
            }}
            endAdornment={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '4px',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleArrowClick('positionY', 1)}
                  sx={{ color: '#844ABE', padding: '4px' }}
                >
                  <FaChevronUp color="grey" fontSize={10}/>
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleArrowClick('positionY', -1)}
                  sx={{ color: '#844ABE', padding: '4px' }}
                >
                  <FaChevronDown color="grey" fontSize={10}/>
                </IconButton>
              </Box>
            }
          />
          <Typography>Y</Typography>
        </Box>

        {/* Rotate */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <Typography sx={{ flexGrow: 1 }}>Rotate</Typography>
          <Slider
            value={rotate}
            onChange={(e, val) => setRotate(val)}
            min={-180}
            max={180}
            step={1}
            sx={{ color: '#844ABE', flexGrow: 3, marginLeft: '16px' }}
          />
          <Input
            value={`${rotate}°`}
            readOnly
            disableUnderline
            sx={{
              width: '60px',
              backgroundColor: '#1F1F1F',
              textAlign: 'center',
              borderRadius: '8px',
              color: 'white',
              marginLeft: '16px',
              fontSize: '14px',
            }}
          />
        </Box>
      </Box>

      {/* Blend Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold', flexGrow: 1 }}>
            Blend
          </Typography>
          <IconButton onClick={() => handleReset('opacity')} sx={{ color: 'grey' }}>
          <FaRedo fontSize={15}/>
          </IconButton>
        </Box>

        {/* Mode */}
        <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '2rem',
  }}
>
  <Typography>Mode</Typography>
  <Select
    value={blendMode}
    onChange={(e) => setBlendMode(e.target.value)}
    displayEmpty
    IconComponent={() => <FaChevronDown />}
    sx={{
      fontSize: '14px',
      width: '100%', // Adjust width as needed
      height: '40px',
      backgroundColor: '#1F1F1F',
      color: 'white',
      borderRadius: '8px',
      paddingRight: '28px', // Add padding for the icon
      '.MuiSelect-icon': {
        color: 'white',
        right: '8px', // Position the icon properly
        pointerEvents: 'none', // Prevent the icon from blocking clicks
      },
    }}
  >
    <MenuItem value="Normal" sx={{ fontSize: '10px' }}>
      Normal
    </MenuItem>
    <MenuItem value="Multiply" sx={{ fontSize: '10px' }}>
      Multiply
    </MenuItem>
    <MenuItem value="Screen" sx={{ fontSize: '10px' }}>
      Screen
    </MenuItem>
  </Select>
</Box>

        {/* Opacity */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <Typography sx={{ flexGrow: 1 }}>Opacity</Typography>
          <Slider
            value={opacity}
            onChange={(e, val) => setOpacity(val)}
            min={0}
            max={100}
            step={1}
            sx={{ color: '#844ABE', flexGrow: 3, marginLeft: '16px' }}
          />
          <Input
            value={`${opacity}%`}
            readOnly
            disableUnderline
            sx={{
              width: '60px',
              backgroundColor: '#1F1F1F',
              textAlign: 'center',
              borderRadius: '8px',
              color: 'white',
              marginLeft: '16px',
              fontSize: '14px',
            }}
          />
        </Box>
      </Box>
    </Box>
    </div>
  );
};

export default MediaCard;
