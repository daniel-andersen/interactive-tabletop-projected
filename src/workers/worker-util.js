import OpenCvUtil from './opencv-util'

export default class WorkerUtil {
    static getImageDataFromPayload(payload) {
        return new ImageData(new Uint8ClampedArray(payload.image.buffer), payload.image.width, payload.image.height)
    }

    static fireWhenReady(callback) {
        if (WorkerUtil.isReady) {
            callback()
        } else {
            WorkerUtil.readyCallbacks.push(callback)
        }
    }

    static ready() {
        WorkerUtil.isReady = true
        for (const callback of WorkerUtil.readyCallbacks) {
            callback()
        }
        WorkerUtil.readyCallbacks = []
    }

    static handleResponseWithImage(meta, imageData, data={}, transferables=[]) {
        if (!meta.functionCall) {
            postMessage({
                meta: meta,
                payload: Object.assign({},
                    data,
                    {
                        "image": {
                            "width": imageData.width,
                            "height": imageData.height,
                            "buffer": imageData.data.buffer
                        }
                    }
                )
            }, transferables.concat([imageData.data.buffer]))
        }

        return Object.assign({},
            data,
            {
                image: imageData
            }
        )
    }

    static handleResponse(meta, data={}, transferables=[]) {
        if (!meta.functionCall) {
            postMessage({
                meta: meta,
                payload: data
            }, transferables)
        }

        return data
    }

    static postDebugImage(meta, image, data={}, transferables=[]) {
        const colorImage = OpenCvUtil.getColorImage(image)
        const imageData = new ImageData(new Uint8ClampedArray(colorImage.data), colorImage.cols, colorImage.rows)

        postMessage({
            type: "debug",
            meta: meta,
            payload: Object.assign({},
                data,
                {
                    "image": {
                        "width": imageData.width,
                        "height": imageData.height,
                        "buffer": imageData.data.buffer
                    }
                }
            )
        }, transferables.concat([imageData.data.buffer]))
    }
}


WorkerUtil.readyCallbacks = []
WorkerUtil.isReady = false
