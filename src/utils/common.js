export function translateGroupSystemNotice(message) {
  const groupName = message.payload.groupProfile.name || message.payload.groupProfile.groupID
  switch (message.payload.operationType) {
    case 1:
      return `${message.payload.operatorID} apply to join the group: ${groupName}`
    case 2:
      return `Successfully joined the group: ${groupName}`
    case 3:
      return `Apply to join the group: ${groupName} was rejected`
    case 4:
      return `You were kicked out of the group by the administrator ${message.payload.operatorID}: ${groupName}`
    case 5:
      return `Group: ${groupName} has been disbanded by ${message.payload.operatorID}`
    case 6:
      return `${message.payload.operatorID} Create group: ${groupName}`
    case 7:
      return `${message.payload.operatorID} invites you to join a group: ${groupName}`
    case 8:
      return `You leave the group: ${groupName}`
    case 9:
      return `You are set by ${message.payload.operatorID} as a group: the administrator of ${groupName}`
    case 10:
      return `You were revoked by ${message.payload.operatorID}. Group: the administrator status of ${groupName}`
    case 255:
      return 'Custom group system notification: ' + message.payload.userDefinedField
  }
}

export const errorMap = {
  500: 'Server error',
  602: 'User name or password is illegal',
  610: 'User name format error',
  612: 'User already exists',
  620: 'User does not exist',
  621: 'Password error'
}

export function getUrlKey(name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  let r = window.location.search.substr(1).match(reg)
  if (r != null) {
    return unescape(r[2])
  }
  return null
}

export function isValidFlv(url) {
  let domian = url.replace(/^https?:\/\/(.*?)(:\d+)?\/.*$/, '$1').toString()
  return domian === '3891.liveplay.myqcloud.com'
}
