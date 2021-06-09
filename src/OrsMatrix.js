import request from 'superagent'
import Promise from 'bluebird'
import OrsUtil from './OrsUtil'
import Constants from './constants'

const orsUtil = new OrsUtil()

class OrsMatrix {
  constructor(args) {
    this.meta = null
    this.args = {}
    if (Constants.propNames.apiKey in args) {
      this.args[Constants.propNames.apiKey] = args[Constants.propNames.apiKey]
    } else {
      // eslint-disable-next-line no-console
      console.log(Constants.missingAPIKeyMsg)
    }
  }

  calculate(reqArgs) {
    // Get custom header and remove from args
    this.customHeaders = []
    if (reqArgs.customHeaders) {
      this.customHeaders = reqArgs.customHeaders
      delete reqArgs.customHeaders
    }
    orsUtil.setRequestDefaults(this.args, reqArgs, true)
    // eslint-disable-next-line prettier/prettier
    if (!this.args[Constants.propNames.service] && !reqArgs[Constants.propNames.service]) {
      this.args[Constants.propNames.service] = 'matrix'
    }

    orsUtil.copyProperties(reqArgs, this.args)
    const that = this

    return new Promise(function(resolve, reject) {
      const timeout = that.args[Constants.propNames.timeout] || 10000

      // eslint-disable-next-line prettier/prettier
      if (that.args[Constants.propNames.apiVersion] === Constants.defaultAPIVersion) {
        if (that.meta == null) {
          that.meta = orsUtil.prepareMeta(that.args)
        }
        that.httpArgs = orsUtil.prepareRequest(that.args)

        let url = orsUtil.prepareUrl(that.meta)
        let authorization = that.meta[Constants.propNames.apiKey]

        let orsRequest = request
          .post(url)
          .send(that.httpArgs)
          .set('Authorization', authorization)
          .timeout(timeout)

        for (let key in that.customHeaders) {
          orsRequest.set(key, that.customHeaders[key])
        }
        orsRequest.end(function(err, res) {
          if (err || !res.ok) {
            // eslint-disable-next-line no-console
            console.error(err)
            reject(err)
          } else if (res) {
            resolve(res.body || res.text)
          }
        })
      } else {
        // eslint-disable-next-line no-console
        console.error(Constants.useAPIV2Msg)
      }
    })
  }
}

export default OrsMatrix
