export function validate_startend(data) {
  if (data.selected.length != 2)
    return false;
  return true;
}

export function validate_breaks(data) {
  return true;
}

export function validate_cycle(data) {
  for (let i=0;i<data.days.length;i++) {
    if (data.days[i].length < 1)
      return false;
    for (let j=0;j<data.days[i].length;j++) {
      if (data.days[i][j].time == '' || data.days[i][j].name == '')
        return false;
      if (j != data.days[i].length - 1)
        if (parseInt(data.days[i][j].time.split(':')[0]*60+data.days[i][j].time.split(':')[1]) >= parseInt(data.days[i][j+1].time.split(':')[0]*60+data.days[i][j+1].time.split(':')[1]))
            return false;
    }
  }
  return true
}