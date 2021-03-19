const styles = (theme) => ({
  mainDiv: {
    width: "40%",
    marginLeft: "30%",
    marginRight: "30%",
    boxShadow: "0 2px 7px 0px rgba(0,0,0,.1)",
    padding: 20,
    overflowX: "hidden",
    overflowY: "auto"
  },

  mainDivMobile: {
    width: "90%",
    marginLeft: "5%",
    marginRight: "5%",
    boxShadow: "0 2px 7px 0px rgba(0,0,0,.1)",
    padding: 20,
    overflowX: "hidden",
    overflowY: "auto"
  },

  btnDiv: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: 10
  },

  room: {
    padding: 20,
    marginBottom: 10,
    color: "white",
    backgroundColor: "#212042",
    borderRadius: 10,
    boxShadow: "0 2px 7px 0px rgba(0,0,0,.1)",
    cursor: "pointer",
    border: "5px solid"
    ,
    "&:hover": {
      borderColor: "black"
    }
  },

  info: {
    borderRadius: 10,
    backgroundColor: "#212042",
    padding: 10,
    color: "white"
  },

  infoDiv: {
    marginBottom: 10
  },

  buildingLbl: {
    fontSize: 20,
    fontWeight: "bold",
  },

  addMeeting: {
    border: "1px solid",
    padding: 20,
    borderRadius: "10px",
    color: "#212042",
    borderWidth: 3
  },

  addMeetingBtn: {
    display: "flex",
    justifyContent: "space-around"
  },

  roomHeading : {
    fontSize : 20,
    fontWeight: "bold"
  },

  backBtn : {
    marginTop:10,
    marginBottom:10,
    textTransForm: "none"
  },

  freeRoomLbl : {
    fontSize : 20,
    fontWeight: "bold",
    marginBottom: 10
  },

  textTransForm : {
    textTransform: "none"
  },

  width70 : {
    width:"70%"
  },

  



});
export default styles;
