export function validate_startend(data) {
  if (data.selected.length != 2)
    return false;
  return true;
}

export function validate_breaks(data) {
  return true;
}

export function validate_cycle(data) {
  for (let i=0;i<cycle.days.length;i++) {
    if (cycle.days[i].length < 1)
      return false;
    for (let j=0;j<cycle.days[i].length;j++) {
      if (cycle.days[i][j].time == '' || cycle.days[i][j].name == '')
        return false;
      if (j != cycle.days[i].length - 1)
        if (cycle.days[i][j].time.split(':')[0]*60+cycle.days[i][j].time.split(':')[1] >= cycle.days[i][j+1].time.split(':')[0]*60+cycle.days[i][j+1].time.split(':')[1])
          return false;
    }
  }
  return true
}