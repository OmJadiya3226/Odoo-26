import { useState } from 'react'
import axios from 'axios'

function AIChat() {
    const [prompt, setPrompt] = useState('')
    const [response, setResponse] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setResponse('')

        try {
            const result = await axios.post('http://localhost:3000/ai/generate', {
                prompt: prompt
            })
            setResponse(result.data.response)
        } catch (error) {
            console.error('Error:', error)
            setResponse('Error: ' + (error.response?.data?.error || error.message))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px'
        }}>
            <h2>🤖 Ask Gemini AI</h2>

            <form onSubmit={handleSubmit}>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask me anything..."
                    rows="3"
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        marginBottom: '10px'
                    }}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        background: loading ? '#ccc' : '#4285f4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Thinking...' : 'Ask AI'}
                </button>
            </form>

            {response && (
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: '#f0f0f0',
                    borderRadius: '5px',
                    whiteSpace: 'pre-wrap'
                }}>
                    <strong>AI Response:</strong>
                    <p>{response}</p>
                </div>
            )}
        </div>
    )
}

export default AIChat