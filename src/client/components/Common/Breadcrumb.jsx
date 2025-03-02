// src/client/components/Common/Breadcrumb.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const Breadcrumb = ({ items }) => {
  return (
    <div className="bg-gray-100 p-3 mb-4 rounded">
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
      >
        <MuiLink
          component={Link}
          to="/"
          color="inherit"
          className="flex items-center"
        >
          <HomeIcon fontSize="small" className="mr-1" />
        </MuiLink>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return isLast ? (
            <Typography key={index} color="text.primary" className="font-semibold">
              {item.label}
            </Typography>
          ) : (
            <MuiLink
              key={index}
              component={Link}
              to={item.path}
              color="inherit"
            >
              {item.label}
            </MuiLink>
          );
        })}
      </Breadcrumbs>
    </div>
  );
};

export default Breadcrumb;