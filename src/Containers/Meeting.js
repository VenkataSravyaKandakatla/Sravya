import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import styles from "./Styles/MeetingStyle";
import { Grid, Button, Typography } from "@material-ui/core";
import moment from "moment";
import { notify } from "react-notify-toast";
import Notification from "react-notify-toast";
import withWidth, { isWidthDown } from "@material-ui/core/withWidth";
import { reactLocalStorage } from "reactjs-localstorage";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@material-ui/core";

class Meeting extends Component {
  constructor(props) {
    super(props);

    this.state = {
      date: moment().format("MM/DD/yyyy"),
      startTime: moment(new Date(), "hh:mm a"),
      endTime: moment(new Date(), "hh:mm a"),
      selectedBuildingId: -1,
      showTodaysMeetingInfo: true,
      showAddMeeting: false,
      showRoomSelect: false,
      buildings: null, // Total buildings
      floors: null, // Total floors - Each building has three floors
      rooms: null, // Total rooms
      meetings: null,
      availableRoomIds: [], // Contains the available (free) room ids for the selected date and time
      canSave: true,
      mobileView: false, // To check whethher in mobile view or desktop view
    };
  }

  resize() {
    if (isWidthDown("xs", this.props.width)) {
      this.setState({ mobileView: true });
    } else {
      this.setState({ mobileView: false });
    }
  }

  componentWillMount = () => {
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();

    let buildings = reactLocalStorage.getObject("buildings");
    let floors = reactLocalStorage.getObject("floors");
    let rooms = reactLocalStorage.getObject("rooms");
    let meetings = reactLocalStorage.getObject("meetings");

    // Check if data is present in cookie, else add data to cookiew
    if (buildings.length && floors.length && rooms.length) {
      // If data is already present in cookie updating the
      //available the room ids for current time from all the meetings

      console.log(JSON.stringify(meetings))
      this.setState(
        {
          buildings: buildings,
          floors: floors,
          rooms: rooms,
          meetings: meetings,
          selectedBuildingId: buildings[0].id,
        },
        () => {
          this.updateAvailableRoomsForCurrentTime();
        }
      );
    } else {
      let buildings = [],
        floors = [],
        rooms = [];
      let roomId = 0;
      for (let i = 1; i <= 4; i++) {
        // Inserting 4 buildings
        let building = {};
        building.id = i;
        building.name = "Building" + i;

        buildings[i - 1] = building;

        for (let j = 1; j <= 3; j++) {
          // Inserting 3 floors for each building
          let floor = {};
          let floorId = (i - 1) * 3 + j;
          floor.id = floorId;
          floor.name = "floor" + j;
          floor.buildingId = i;

          floors[floorId - 1] = floor;

          let roomPerFloor = j === 3 ? 1 : 2; // Adding 2 rooms for 1st and 2nd floor, 1 room for 3rd floor
          for (let roomIndex = 1; roomIndex <= roomPerFloor; roomIndex++) {
            let room = {};
            roomId++;
            room.id = roomId;
            room.floorId = floorId;
            room.name = "Room" + roomId;
            rooms[roomId - 1] = room;
          }
        }
      }

      // Setting the data to cookies and updating the available room ids
      reactLocalStorage.setObject("buildings", buildings);
      reactLocalStorage.setObject("floors", floors);
      reactLocalStorage.setObject("rooms", rooms);
      reactLocalStorage.setObject("meetings", []);

      this.setState(
        {
          buildings: buildings,
          floors: floors,
          rooms: rooms,
          meetings: [],
          selectedBuildingId: buildings[0].id,
        },
        () => {
          this.updateAvailableRoomsForCurrentTime();
        }
      );
    }
  };

  // Sets the selected date
  handleDateChange = (date) => {
    this.setState({ date: moment(date).format("MM/DD/yyyy") });
  };

  // Sets the selected start time of the meeting
  handleStartTimeChange = (time) => {
    this.setState({ startTime: time }, () => {
      this.checkTimeRange();
    });
  };

  // Sets the selected end time of the meeting
  handleEndTimeChange = (time) => {
    this.setState({ endTime: time }, () => {
      this.checkTimeRange();
    });
  };

  // Sets the selected building id
  selSelectedBuilding = (event) => {
    this.setState({ selectedBuildingId: event.target.value });
  };

  // method to display the building name based on the building id in room selection div
  getBuildingName = (buildingId) => {
    let { buildings } = this.state;
    let building = buildings.filter(
      (building, index) => buildingId === building.id
    );
    return <div>{building[0].name}</div>;
  };

  // Checks whether the selected time range is valid or not
  checkTimeRange = () => {
    let { startTime, endTime } = this.state;

    if (startTime.isAfter(endTime) || startTime.isSame(endTime)) {
      notify.show("Please select a valid time range", "error", 3000);
      this.setState({ canSave: false });
    } else {
      this.setState({ canSave: true });
    }
  };

  // Method to add a metting after selecting meeting information and room
  addMeeting = (roomId) => {
    let { startTime, endTime, date } = this.state;
    let meeting = {},
      allMeetings = [];

    let meetingId = 1; // Check and generate the id for new meeting
    let meetings = reactLocalStorage.getObject("meetings");
    if (meetings.length) {
      allMeetings = meetings;
      meetingId = meetings.length + 1;
    }

    meeting.id = meetingId;

    meeting.startTime = moment(startTime).format("hh:mm a");
    meeting.endTime = moment(endTime).format("hh:mm a");
    meeting.date = date;
    meeting.roomId = roomId;

    allMeetings.push(meeting);

    reactLocalStorage.setObject("meetings", allMeetings);
    notify.show("Meeting is successfully scheduled", "success", 3000);
    this.setState(
      {
        meetings: allMeetings,
        showTodaysMeetingInfo: true,
        showRoomSelect: false,
      },
      () => {
        this.updateAvailableRoomsForCurrentTime();
      }
    );
  };

  // Checks and updates the avilable rooms for selected date and time range
  checkAndUpdateAvailableRoomsForTimeRange = () => {
    let { rooms, meetings, date, startTime, endTime } = this.state;
    let availableRoomIds = [];
    startTime = moment(startTime, "hh:mm a");
    endTime = moment(endTime, "hh:mm a");

    if (startTime.isSame(endTime)) {
      notify.show("Please select a valid time range", "error", 3000);
    } else {
      for (let i = 0; i < rooms.length; i++) {
        let roomAvailable = true;
        for (let j = 0; j < meetings.length; j++) {
          let meetingDate = meetings[j].date;
          let meetingRoomId = meetings[j].roomId;
          let meetingStartTime = moment(meetings[j].startTime, "hh:mm a");
          let meetingEndTime = moment(meetings[j].endTime, "hh:mm a");

          if (
            !(
              (startTime.isBefore(meetingStartTime) &&
                endTime.isSameOrBefore(meetingStartTime)) ||
              (startTime.isSameOrAfter(meetingEndTime) &&
                endTime.isAfter(meetingEndTime))
            ) &&
            meetingDate === date &&
            rooms[i].id === meetingRoomId
          ) {
            roomAvailable = false;
            break;
          }
        }
        if (roomAvailable) {
          availableRoomIds.push(rooms[i].id);
        }
      }
      this.setState({
        availableRoomIds: availableRoomIds,
        showRoomSelect: true,
        showAddMeeting: false,
      });
    }
  };

  // Checks and updates available room ids for current date and time
  updateAvailableRoomsForCurrentTime = () => {
    let availableRoomIds = [];
    let { rooms, meetings } = this.state;
    let currentDate = moment().format("MM/DD/yyyy");
    let currentTime = moment(new Date()).format("hh:mm a");
    currentTime = moment(currentTime, "hh:mm a");

    for (let i = 0; i < rooms.length; i++) {
      let meetingRooms = meetings.filter(
        (meeting) =>
          meeting.roomId === rooms[i].id &&
          meeting.date === currentDate &&
          moment(meeting.startTime, "hh:mm a").isSameOrBefore(currentTime) &&
          moment(meeting.endTime, "hh:mm a").isSameOrAfter(currentTime)
      );
      if (!meetingRooms.length) {
        availableRoomIds.push(rooms[i].id);
      }

      this.setState({ availableRoomIds: availableRoomIds });
    }
  };

  render() {
    let {
      date,
      startTime,
      endTime,
      selectedBuildingId,
      showAddMeeting,
      showRoomSelect,
      showTodaysMeetingInfo,
      buildings,
      floors,
      rooms,
      availableRoomIds,
      canSave,
      mobileView,
      meetings,
    } = this.state;

    const { classes } = this.props;
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          direction: "column",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* To show the notifications */}
        <Notification options={{ zIndex: 1500 }} />

        <div className={mobileView ? classes.mainDivMobile : classes.mainDiv}>
          {/* Show overall information */}
          {showTodaysMeetingInfo && (
            <div className={classes.addMeeting}>
              <div>
                <Grid container>
                  <Grid item xs={12} sm={12} className={classes.addMeetingBtn}>
                    <Typography className={classes.buildingLbl}>
                      Meetings information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} className={classes.infoDiv}>
                    <Typography className={classes.buildingLbl}>
                      Buildings
                    </Typography>
                    <Typography>
                      Total {buildings.length ? buildings.length : 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} className={classes.infoDiv}>
                    <Typography className={classes.buildingLbl}>
                      Rooms
                    </Typography>
                    <Typography>Total {rooms.length}</Typography>
                    <Typography>Free now {availableRoomIds.length}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={12} className={classes.infoDiv}>
                    <Typography className={classes.buildingLbl}>
                      Meetings
                    </Typography>
                    <Typography>
                      Total{" "}
                      {
                        meetings.filter(
                          (meeting) =>
                            meeting.date === moment().format("MM/DD/yyyy")
                        ).length
                      }{" "}
                      Today
                    </Typography>
                    <Typography>
                      Total {rooms.length - availableRoomIds.length} Going on
                      now
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} className={classes.addMeetingBtn}>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.textTransForm}
                      onClick={() => {
                        this.setState({
                          showTodaysMeetingInfo: false,
                          showAddMeeting: true,
                          canSave: true,
                          date: moment().format("MM/DD/yyyy"),
                          startTime: moment(new Date(), "hh:mm a"),
                          endTime: moment(new Date(), "hh:mm a"),
                        });
                      }}
                    >
                      Add a meeting
                    </Button>
                  </Grid>
                </Grid>
              </div>
            </div>
          )}

          {/* Display the free rooms for selected date and time */}
          {showRoomSelect && (
            <div>
              <div style={{ padding: 20 }}>
                <div item xs={12} sm={12} className={classes.addMeetingBtn}>
                  <Typography className={classes.freeRoomLbl}>
                    Please select one of the free rooms
                  </Typography>
                </div>
                {floors
                  .filter((floor) => floor.buildingId === selectedBuildingId)
                  .map((floor, index) => (
                    <div>
                      {rooms
                        .filter(
                          (room) =>
                            room.floorId === floor.id &&
                            availableRoomIds.includes(room.id)
                        )
                        .map((room) => (
                          <div
                            className={classes.room}
                            onClick={() => {
                              this.addMeeting(room.id);
                            }}
                          >
                            <Typography className={classes.roomHeading}>
                              {room.name}
                            </Typography>
                            <Typography>{floor.name}</Typography>
                            <Typography>
                              {this.getBuildingName(floor.buildingId)}
                            </Typography>
                          </div>
                        ))}
                    </div>
                  ))}
                <div className={classes.addMeetingBtn}>
                  <Button
                    variant="contained"
                    color="secondary"
                    className={classes.backBtn}
                    onClick={() => {
                      this.setState({
                        showRoomSelect: false,
                        showAddMeeting: true,
                      });
                    }}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Show add meeting division */}
          {showAddMeeting && (
            <div className={classes.addMeeting}>
              <Grid container>
                <Grid item xs={12} sm={12} className={classes.addMeetingBtn}>
                  <Typography className={classes.buildingLbl}>
                    Add meeting
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Grid container justify="space-around">
                      <KeyboardDatePicker
                        className = {classes.width70}
                        margin="normal"
                        id="date-picker-dialog"
                        label="Date"
                        format="MM/DD/yyyy"
                        value={date}
                        minDate={new Date()}
                        KeyboardButtonProps={{
                          "aria-label": "change date",
                        }}
                        onChange={this.handleDateChange}
                      />
                    </Grid>
                  </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Grid container justify="space-around">
                      <KeyboardTimePicker
                      className = {classes.width70}
                        margin="normal"
                        id="time-picker"
                        label="Start time"
                        format="hh:mm A"
                        value={startTime}
                        onChange={this.handleStartTimeChange}
                        KeyboardButtonProps={{
                          "aria-label": "change time",
                        }}
                      />
                    </Grid>
                  </MuiPickersUtilsProvider>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Grid container justify="space-around">
                      <KeyboardTimePicker
                      className = {classes.width70}
                        margin="normal"
                        id="time-picker"
                        label="End time"
                        format="hh:mm A"
                        value={endTime}
                        onChange={this.handleEndTimeChange}
                        KeyboardButtonProps={{
                          "aria-label": "change time",
                        }}
                      />
                    </Grid>
                  </MuiPickersUtilsProvider>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={12}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <FormControl className={classes.width70}>
                    <InputLabel id="demo-simple-select-helper-label">
                      Building
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-helper-label"
                      id="demo-simple-select-helper"
                      value={selectedBuildingId}
                      onChange={this.selSelectedBuilding}
                    >
                      {buildings.map((building, index) => (
                        <MenuItem value={building.id}>{building.name}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Choose building</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={12} className={classes.btnDiv}>
                  <Button
                    variant="contained"
                    color="secondary"
                    className={classes.textTransForm}
                    onClick={() => {
                      this.setState({
                        showAddMeeting: false,
                        showTodaysMeetingInfo: true,
                      });
                    }}
                  >
                    Back
                  </Button>

                  {canSave && (
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.textTransForm}
                      onClick={() => {
                        this.checkAndUpdateAvailableRoomsForTimeRange();
                      }}
                    >
                      Next
                    </Button>
                  )}
                </Grid>
              </Grid>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withWidth()(withStyles(styles)(Meeting));
