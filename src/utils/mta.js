import MTA from 'mta-h5-analysis'

MTA.init({
  'sid': '500702399', //Required, appid for statistics
  'cid': '500702403', //If custom events are enabled, this item is required, otherwise leave it blank
  'autoReport': 1,//Whether automatic reporting is enabled (1: report once when init is completed, 0: report only when using pgv method)
  'senseHash': 0, //Does the hash anchor point enter url statistics
  'senseQuery': 0, //Whether the url parameter enters url statistics
  'performanceMonitor': 0,//Whether to enable performance monitoring
  'ignoreParams': [] //When url parameter reporting is enabled, some parameters can be ignored for splicing and reporting
})

export default MTA