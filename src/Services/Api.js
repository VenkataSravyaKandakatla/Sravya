// a library to wrap and simplify api calls
import apisauce from "apisauce";
import {reactLocalStorage} from 'reactjs-localstorage';

let SERVER_URL = "https://order.forkbase.com/glaceoffice_data/moffice";

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  SERVER_URL = "http://localhost/glaceoffice_data/moffice";
}

// our "constructor"
const create = (baseURL = SERVER_URL) => {
  const api = apisauce.create({
    // base URL is read from the "constructor"
    baseURL,
    // here are some default headers
    headers: {
      "Cache-Control": "no-cache",
    },
    // 10 second timeout...
    timeout: 100000
  });

  const createPOSTApiCall = (endpoint, params, body, callback) => {
    api.post(endpoint+"?dbname="+reactLocalStorage.getObject('dbname'), params, body).then((res) => {
      callback(res);
    });
    console.log("/" + endpoint);
  };

  const createGETApiCall = (endpoint, params, callback) => {
    api.get(endpoint+"?dbname="+reactLocalStorage.getObject('dbname'), params).then((res) => {
      callback(res);
    });
    console.log("/" + endpoint);
  };

  const menuItemList = (entity, callback) => {
    createGETApiCall("customerServices.Action/menuItemList", {entity}, callback);
  };

  const getOrganizationLocation = (callback) => {
    createGETApiCall("customerServices.Action/getOrganizationLocation", {}, callback);
  };

  const getMainMenu = (locationId,callback) => {
    createGETApiCall("/customerServices.Action/getMainMenu1", {locationId}, callback);
  };
  const getMainMenuCategories = (menuId,locationId,callback) => {
    createGETApiCall("/customerServices.Action/getMainMenuCategories1", {menuId,locationId}, callback);
  };
  const getMenuPartInfoForCustomization = (partId,callback) => {
    createGETApiCall("/customerServices.Action/getMenuPartInfoForCustomization", {partId}, callback);
  };
  const getListOfTimes = (locationId,callback) => {
    createGETApiCall("customer.Action/getListOfTimes", {locationId}, callback);
  };
  const validateSoldout = (validate,callback) => {
    createPOSTApiCall("salesConfig.Action/validateSoldout", validate, {}, callback);
  };
  const getTipsConfiguration = (callback) => {
    createGETApiCall("customerServices.Action/getTipsConfiguration", {}, callback);
  };
  const getReviewSettings = (callback) => {
    createGETApiCall("/salesConfig.Action/getReviewSettings", {}, callback);
  };
  const saveReview = (partId, review, reviewNeedApproval, name, phone, email, callback) => {
    createPOSTApiCall("sales.Action/saveReview", null, {params : {partId, review, name, phone, email, reviewNeedApproval}}, callback);
  };

  const saveOption = (partId, option, prevSelOp, isAdd, name, phone, email, callback) => {
    createPOSTApiCall("sales.Action/saveOption", null, {params : {partId, option, prevSelOp, isAdd, name, phone, email}}, callback);
  };

  const getLatestReviewsOfItem = (partId, callback) => {
    createPOSTApiCall("sales.Action/getLatestReviewsOfItem", null, {params : {partId}}, callback);
  };

  const getReviewsCountOfItem = (partId, callback) => {
    createPOSTApiCall("sales.Action/getReviewsCountOfItem", null, {params : {partId}}, callback);
  };

  const saveRating = (partId, rating, starRatingNeedApproval, name, phone, email, callback) => {
    createPOSTApiCall("sales.Action/saveRating", rating, {params : {partId, name, phone, email, starRatingNeedApproval}}, callback);
  };

  const getAvgRatingOfItem = (partId, callback) => {
    createPOSTApiCall("sales.Action/getAvgRatingOfItem", null, {params : {partId}}, callback);
  };

  return {
    menuItemList,
    getOrganizationLocation,
    getMainMenu,
    getMainMenuCategories,
    getMenuPartInfoForCustomization,
    getListOfTimes,
    validateSoldout,
    getTipsConfiguration,
    getReviewSettings,
    saveReview,
    saveOption,
    getLatestReviewsOfItem,
    getReviewsCountOfItem,
    saveRating,
    getAvgRatingOfItem,
  };
};

export default {
  create
};
