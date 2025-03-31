// SSE only supports GET request
export async function GET({ url }) {
    const stream = new ReadableStream({
        start(controller) {
            // You can enqueue multiple data asynchronously here.
            const myData = ["abc", "def"]
            myData.forEach(data => {
                controller.enqueue(`data: ${data}\n\n`)
            })
            controller.close()
        },
        cancel() {
            // cancel your resources here
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
        }
    })
}