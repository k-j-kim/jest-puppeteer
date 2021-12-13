import path from 'path'
// eslint-disable-next-line import/no-extraneous-dependencies
import puppeteer from 'puppeteer'
import { setup, teardown } from '../src/global'

describe('setup', () => {
  describe('browserWSEndpoint in config connect' , () => {
    const connectSpy = jest.spyOn(puppeteer, 'connect')
    beforeEach(() => {
      process.env.JEST_PUPPETEER_CONFIG = path.resolve(
        __dirname,
        '__fixtures__/browserWsEndpointConfig.js',
      )
    })

    it('should not call puppeteer.connect', async () => {
      await setup()
      expect(connectSpy).not.toHaveBeenCalled()
    })
    
    it('should set the ws-endpoint to the one provided in config', async () => {
      await setup()
      expect(process.env.BROWSERS_COUNT).toBe('1')
      const wsEndPoint = JSON.parse(process.env.PUPPETEER_WS_ENDPOINTS)[0]
      expect(wsEndPoint).toBe('wss://end.point')
    })
  })

  describe('browserWSEndpoint not in config connect' , () => {
    const launchSpy = jest.spyOn(puppeteer, 'launch')
    beforeEach(() => {
      process.env.JEST_PUPPETEER_CONFIG = path.resolve(
        __dirname,
        '__fixtures__/launchConfig.js',
      )
    })
    afterEach(async () => {
      await teardown()
    })

    it('should call puppeteer.launch or connect as per the need', async () => {
      await setup()
      expect(launchSpy).toHaveBeenCalled()
    })
    
    it('should use ws-endpoint generated by launch or connect', async () => {
      await setup()
      expect(process.env.BROWSERS_COUNT).toBe('1')
      const wsEndPoint = JSON.parse(process.env.PUPPETEER_WS_ENDPOINTS)[0]
      const wsRegex = /^(ws):\/\/(127.0.0.1):(?<num>\d{4,5})(\/devtools\/browser\/)(.*)$/
      expect(wsEndPoint).toMatch(wsRegex)
    })
  })
})
