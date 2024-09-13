import { createSlice } from "@reduxjs/toolkit";

const rootSlice = createSlice({
  name: "root",
  initialState: {
    loading: false,
    skillnaavData: null,
    reloadData: false,
    compImageUrls: [],
  },
  reducers: {
    ShowLoading: (state) => {
      state.loading = true;
    },
    HideLoading: (state) => {
      state.loading = false;
    },
    SetSkillNaavData: (state, action) => {
      state.skillnaavData = action.payload;
    },
    ReloadData: (state, action) => {
      state.reloadData = action.payload;
    },
    UpdateCompImageUrls: (state, action) => {
      state.compImageUrls = action.payload;
    },
  },
});

export const {
  ShowLoading,
  HideLoading,
  SetSkillNaavData,
  ReloadData,
  UpdateCompImageUrls,
} = rootSlice.actions;

export const rootReducer = rootSlice.reducer;
