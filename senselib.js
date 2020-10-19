const imu = require("node-sense-hat").Imu;
const IMU = new imu.IMU();
var senseData = {};

const headingCorrection = (heading, offset = 0) => {
  // Once you have your heading, you must then add your 'Declination Angle', which is the 'Error' of the magnetic field in your location.
  // Find yours here: http://www.magnetic-declination.com/
  const declinationAngle = 0.03106686;

  heading += declinationAngle + offset;

  // Correct for when signs are reversed.
  if (heading < 0) {
    heading += 2 * Math.PI;
  }

  // Check for wrap due to addition of declination.
  if (heading > 2 * Math.PI) {
    heading -= 2 * Math.PI;
  }

  return heading;
};

const headingToDegree = heading => {
  // Convert radians to degrees for readability.
  return heading * 180 / Math.PI;
};

const getSensorData = () => {
  console.log('reading...');
  IMU.getValue((err, data) => {
    if (err !== null) {
      console.error("Could not read sensor data: ", err);
    } else {
      senseData = data;
    }
  });
}

const getData = async () => {
  return senseData
}

setInterval(getSensorData, 1000)

module.exports.getData = getData;