import { Box } from '@mui/material';
import React from 'react';

interface Children {
    children: string | JSX.Element | JSX.Element[] | '() => JSX.Element | JSX.Element[]';
}

export const IngredientsWrapper = ({ children }: Children) => {
    return <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '.5rem',
            flexWrap: 'wrap'
        }}
        m='1rem 0'
    >
        {children}
    </Box>;
};


