export function convertSecondsToMMSS(seconds: number) {
  // Calculate minutes and seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format with leading zeros if necessary
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
export function isValidMMSSFormat(timeString: string) {
  // Regex to match MM:SS format, where MM and SS are two digits each
  const regex = /^\d{2,10}:\d{2}$/;
  return regex.test(timeString);
}
export function convertMMSSToSeconds(timeString: string) {
  if (!isValidMMSSFormat(timeString)) {
    throw new Error("Invalid time format. Expected MM:SS format.");
  }

  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}
export function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}
