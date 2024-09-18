import React, { useState } from "react";
import {
  TextField,
  IconButton,
  InputAdornment,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import Card from "./Card";

const FilterDialog = ({ open, onClose, onApply }) => {
  const [filters, setFilters] = useState([]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleChange = (event) => {
    setFilters(event.target.value.split(",").map((filter) => filter.trim()));
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Apply Filters</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Filters (comma separated)"
          type="text"
          fullWidth
          variant="standard"
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleApply} color="primary">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState([]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleFilterClick = () => {
    setIsFilterOpen(true);
  };

  const closeFilterDialog = () => {
    setIsFilterOpen(false);
  };

  const applyFilters = (filters) => {
    setAppliedFilters(filters);
    closeFilterDialog();
  };

  const removeFilter = (filterIndex) => {
    setAppliedFilters(
      appliedFilters.filter((_, index) => index !== filterIndex)
    );
  };

  return (
    <Box sx={{ padding: 2, fontFamily: "Poppins, sans-serif" }}>
      {/* Search Bar */}
      <Box
        sx={{
          display: "flex",
          border: "none",
          boxShadow: "none",
          alignItems: "center",
          mb: 2,
        }}
      >
        <TextField
          fullWidth
          placeholder="Search for internships and jobs"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiInputBase-root": {
              backgroundColor: "white",
              border: "none",
              boxShadow: "none",
              //    borderRadius: "4px",
            },
            "& .MuiInputBase-input": {
              padding: "10px 14px",
            },
            "& .MuiInputBase-root:hover": {
              border: "none",
              boxShadow: "none",
            },
            "& .MuiInputBase-root.Mui-focused": {
              border: "none",
              boxShadow: "none",
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleFilterClick}
          startIcon={<FilterListIcon />}
          sx={{ ml: 2 }}
        >
          Filter
        </Button>
      </Box>

      {/* Applied Filters */}
      {appliedFilters.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {appliedFilters.map((filter, index) => (
            <Chip
              key={index}
              label={filter}
              onDelete={() => removeFilter(index)}
              color="primary"
              variant="outlined"
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      )}

      {/* Cards */}
      <Box>
        <Card searchTerm={searchTerm} />
      </Box>

      {/* Filter Dialog */}
      <FilterDialog
        open={isFilterOpen}
        onClose={closeFilterDialog}
        onApply={applyFilters}
      />
    </Box>
  );
};

export default SearchBar;
