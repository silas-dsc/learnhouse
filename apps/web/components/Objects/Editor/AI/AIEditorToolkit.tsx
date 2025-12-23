import React from 'react'
import learnhouseAI_icon from 'public/learnhouse_ai_simple.png'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  AlertTriangle,
  BetweenHorizontalStart,
  FastForward,
  Feather,
  FileStack,
  HelpCircle,
  Languages,
  MoreVertical,
  X,
} from 'lucide-react'
import { Editor } from '@tiptap/react'
import {
  AIEditorStateTypes,
  useAIEditor,
  useAIEditorDispatch,
} from '@components/Contexts/AI/AIEditorContext'
import {
  sendActivityAIChatMessage,
  startActivityAIChatSession,
} from '@services/ai/ai'
import useGetAIFeatures from '@components/Hooks/useGetAIFeatures'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { marked } from 'marked';

type AIEditorToolkitProps = {
  editor: Editor
  activity: any
}

type AIPromptsLabels = {
  label:
  | 'Writer'
  | 'ContinueWriting'
  | 'MakeLonger'
  | 'GenerateQuiz'
  | 'Translate'
  selection: string
}

function AIEditorToolkit(props: AIEditorToolkitProps) {
  const dispatchAIEditor = useAIEditorDispatch() as any
  const aiEditorState = useAIEditor() as AIEditorStateTypes
  const is_ai_feature_enabled = useGetAIFeatures({ feature: 'editor' })
  const [isToolkitAvailable, setIsToolkitAvailable] = React.useState(true)

  React.useEffect(() => {
    if (is_ai_feature_enabled) {
      setIsToolkitAvailable(true)
    }
  }, [is_ai_feature_enabled])

  return (
    <>
      {isToolkitAvailable && (
        <div className="flex space-x-2">
          <AnimatePresence>
            {aiEditorState.isModalOpen && (
              <motion.div
                initial={{ y: 20, opacity: 0.3, filter: 'blur(5px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: 50, opacity: 0, filter: 'blur(3px)' }}
                transition={{
                  type: 'spring',
                  bounce: 0.35,
                  duration: 1.7,
                  mass: 0.2,
                  velocity: 2,
                }}
                className="fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center "
                style={{ pointerEvents: 'none' }}
              >
                <>
                  {aiEditorState.isFeedbackModalOpen && (
                    <UserFeedbackModal
                      activity={props.activity}
                      editor={props.editor}
                    />
                  )}
                  <div
                    style={{
                      pointerEvents: 'auto',
                      background:
                        'linear-gradient(0deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%), radial-gradient(105.16% 105.16% at 50% -5.16%, rgba(255, 255, 255, 0.18) 0%, rgba(0, 0, 0, 0) 100%), rgb(2 1 25 / 98%)',
                    }}
                    className="z-50 rounded-2xl max-w-(--breakpoint-2xl) my-10 mx-auto w-fit fixed bottom-0 left-1/2 transform -translate-x-1/2 shadow-xl ring-1 ring-inset ring-white/10 text-white p-3 flex-col-reverse backdrop-blur-md"
                  >
                    <div className="flex space-x-2">
                      <div className="pr-1">
                        <div className="flex w-full space-x-2 font-bold text-white/80 items-center">
                          <Image
                            className="outline outline-1 outline-neutral-200/20 rounded-lg"
                            width={24}
                            src={learnhouseAI_icon}
                            alt=""
                          />
                          <div className="flex items-center">
                            AI Editor
                          </div>
                          <MoreVertical className="text-white/50" size={12} />
                        </div>
                      </div>
                      <div className="tools flex space-x-2">
                        <AiEditorToolButton label="Writer" />
                        <AiEditorToolButton label="ContinueWriting" />
                        <AiEditorToolButton label="MakeLonger" />
                        <AiEditorToolButton label="GenerateQuiz" />
                        <AiEditorToolButton label="Translate" />
                      </div>
                      <div className="flex space-x-2 items-center">
                        <X
                          onClick={() =>
                            Promise.all([
                              dispatchAIEditor({ type: 'setIsModalClose' }),
                              dispatchAIEditor({
                                type: 'setIsFeedbackModalClose',
                              }),
                            ])
                          }
                          size={20}
                          className="text-white/50 hover:cursor-pointer bg-white/10 p-1 rounded-full items-center"
                        />
                      </div>
                    </div>
                  </div>
                </>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  )
}

const UserFeedbackModal = (props: AIEditorToolkitProps) => {
  const dispatchAIEditor = useAIEditorDispatch() as any
  const aiEditorState = useAIEditor() as AIEditorStateTypes
  const session = useLHSession() as any
  const access_token = session?.data?.tokens?.access_token;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await dispatchAIEditor({
      type: 'setChatInputValue',
      payload: event.currentTarget.value,
    })
  }

  const sendReqWithMessage = async (message: string, use_grammar: boolean = false) => {
    if (aiEditorState.aichat_uuid) {
      await dispatchAIEditor({
        type: 'addMessage',
        payload: { sender: 'user', message: message, type: 'user' },
      })
      await dispatchAIEditor({ type: 'setIsWaitingForResponse' })
      const response = await sendActivityAIChatMessage(
        message,
        aiEditorState.aichat_uuid,
        props.activity.activity_uuid,
        access_token,
        use_grammar
      )
      if (response.success === false) {
        await dispatchAIEditor({ type: 'setIsNoLongerWaitingForResponse' })
        await dispatchAIEditor({ type: 'setIsModalClose' })
        // wait for 200ms before opening the modal again
        await new Promise((resolve) => setTimeout(resolve, 200))
        await dispatchAIEditor({
          type: 'setError',
          payload: {
            isError: true,
            status: response.status,
            error_message: response.data.detail,
          },
        })
        await dispatchAIEditor({ type: 'setIsModalOpen' })
        return ''
      }
      await dispatchAIEditor({ type: 'setIsNoLongerWaitingForResponse' })
      await dispatchAIEditor({ type: 'setChatInputValue', payload: '' })
      await dispatchAIEditor({
        type: 'addMessage',
        payload: { sender: 'ai', message: response.data.message, type: 'ai' },
      })
      return response.data.message
    } else {
      await dispatchAIEditor({
        type: 'addMessage',
        payload: { sender: 'user', message: message, type: 'user' },
      })
      await dispatchAIEditor({ type: 'setIsWaitingForResponse' })
      const response = await startActivityAIChatSession(
        message,
        access_token,
        props.activity.activity_uuid,
        use_grammar
      )
      if (response.success === false) {
        await dispatchAIEditor({ type: 'setIsNoLongerWaitingForResponse' })
        await dispatchAIEditor({ type: 'setIsModalClose' })
        // wait for 200ms before opening the modal again
        await new Promise((resolve) => setTimeout(resolve, 200))
        await dispatchAIEditor({
          type: 'setError',
          payload: {
            isError: true,
            status: response.status,
            error_message: response.data.detail,
          },
        })
        await dispatchAIEditor({ type: 'setIsModalOpen' })
        return ''
      }
      await dispatchAIEditor({
        type: 'setAichat_uuid',
        payload: response.data.aichat_uuid,
      })
      await dispatchAIEditor({ type: 'setIsNoLongerWaitingForResponse' })
      await dispatchAIEditor({ type: 'setChatInputValue', payload: '' })
      await dispatchAIEditor({
        type: 'addMessage',
        payload: { sender: 'ai', message: response.data.message, type: 'ai' },
      })
      return response.data.message
    }
  }

  const handleKeyPress = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      await handleOperation(
        aiEditorState.selectedTool,
        aiEditorState.chatInputValue
      )
    }
  }

  const handleOperation = async (
    label:
      | 'Writer'
      | 'ContinueWriting'
      | 'MakeLonger'
      | 'GenerateQuiz'
      | 'Translate',
    message: string
  ) => {
    // Set selected tool
    await dispatchAIEditor({ type: 'setSelectedTool', payload: label })

    // Check what operation that was
    if (label === 'Writer') {
      let ai_message = ''
      let prompt = getPrompt({ label: label, selection: message })
      await dispatchAIEditor({ type: 'setIsUserInputEnabled', payload: true })
      if (prompt) {
        await dispatchAIEditor({
          type: 'setIsUserInputEnabled',
          payload: false,
        })
        await dispatchAIEditor({ type: 'setIsWaitingForResponse' })
        ai_message = await sendReqWithMessage(prompt)
        await fillEditorWithText(ai_message)
        await dispatchAIEditor({ type: 'setIsNoLongerWaitingForResponse' })
        await dispatchAIEditor({ type: 'setIsUserInputEnabled', payload: true })
      }
    } else if (label === 'ContinueWriting') {
      let ai_message = ''
      let text_selection = getTipTapEditorSelectedTextGlobal()
      let prompt = getPrompt({ label: label, selection: text_selection })
      if (prompt) {
        await dispatchAIEditor({ type: 'setIsWaitingForResponse' })
        ai_message = await sendReqWithMessage(prompt)
        const message_without_original_text = await removeSentences(
          text_selection,
          ai_message
        )
        await fillEditorWithText(message_without_original_text)
        await dispatchAIEditor({ type: 'setIsNoLongerWaitingForResponse' })
      }
    } else if (label === 'MakeLonger') {
      let ai_message = ''
      let text_selection = getTipTapEditorSelectedText()
      let prompt = getPrompt({ label: label, selection: text_selection })
      if (prompt) {
        await dispatchAIEditor({ type: 'setIsWaitingForResponse' })
        ai_message = await sendReqWithMessage(prompt)
        await replaceSelectedTextWithText(ai_message)
        await dispatchAIEditor({ type: 'setIsNoLongerWaitingForResponse' })
      }
    } else if (label === 'GenerateQuiz') {
      let ai_message = ''
      let text_selection = getTipTapEditorSelectedText()
      let prompt = getPrompt({ label: label, selection: text_selection })
      if (prompt) {
        await dispatchAIEditor({ type: 'setIsWaitingForResponse' })
        ai_message = await sendReqWithMessage(prompt, true) // Pass use_grammar: true
        await insertQuizAfterSelection(ai_message)
        await dispatchAIEditor({ type: 'setIsNoLongerWaitingForResponse' })
      }
    } else if (label === 'Translate') {
      let ai_message = ''
      let text_selection = getTipTapEditorSelectedText()
      let prompt = getPrompt({ label: label, selection: text_selection })
      if (prompt) {
        await dispatchAIEditor({ type: 'setIsWaitingForResponse' })
        ai_message = await sendReqWithMessage(prompt)
        await replaceSelectedTextWithText(ai_message)
        await dispatchAIEditor({ type: 'setIsNoLongerWaitingForResponse' })
      }
    }
  }

  const removeSentences = async (
    textToRemove: string,
    originalText: string
  ) => {
    const phrase = textToRemove.toLowerCase()
    const original = originalText.toLowerCase()

    if (original.includes(phrase)) {
      const regex = new RegExp(phrase, 'g')
      const newText = original.replace(regex, '')
      return newText
    } else {
      return originalText
    }
  }

  function parseMarkdownToNodes(markdownText: string) {
    const tokens = marked.lexer(markdownText);

    function parseInlineTokens(tokens) {
      if (!tokens || tokens.length === 0) {
        return [{ type: 'text', text: '' }];
      }

      const content = [];
      
      for (const token of tokens) {
        if (token.type === 'text') {
          content.push({ type: 'text', text: token.text });
        } else if (token.type === 'strong') {
          content.push({
            type: 'text',
            marks: [{ type: 'bold' }],
            text: token.text,
          });
        } else if (token.type === 'em') {
          content.push({
            type: 'text',
            marks: [{ type: 'italic' }],
            text: token.text,
          });
        } else if (token.type === 'codespan') {
          content.push({
            type: 'text',
            marks: [{ type: 'code' }],
            text: token.text,
          });
        } else if (token.type === 'br') {
          content.push({ type: 'hardBreak' });
        } else if (token.type === 'link') {
          content.push({
            type: 'text',
            marks: [{ type: 'link', attrs: { href: token.href } }],
            text: token.text,
          });
        } else {
          // Fallback for unknown inline token types
          content.push({ type: 'text', text: token.text || token.raw || '' });
        }
      }
      
      return content.length > 0 ? content : [{ type: 'text', text: '' }];
    }

    const nodes = [];

    for (const token of tokens) {
      if (token.type === 'heading') {
        nodes.push({
          type: 'heading',
          attrs: { level: token.depth },
          content: token.tokens ? parseInlineTokens(token.tokens) : [{ type: 'text', text: token.text }],
        });
      } else if (token.type === 'paragraph') {
        nodes.push({
          type: 'paragraph',
          content: token.tokens ? parseInlineTokens(token.tokens) : [{ type: 'text', text: token.text }],
        });
      } else if (token.type === 'list') {
        const listNode = {
          type: token.ordered ? 'orderedList' : 'bulletList',
          content: token.items.map((item) => {
            // Extract inline tokens from the first paragraph token in the list item
            let inlineContent = [{ type: 'text', text: item.text }];
            
            if (item.tokens && item.tokens.length > 0) {
              // Find the first paragraph token and extract its inline tokens
              const paragraphToken = item.tokens.find(t => t.type === 'paragraph' || t.type === 'text');
              if (paragraphToken && paragraphToken.tokens) {
                inlineContent = parseInlineTokens(paragraphToken.tokens);
              }
            }
            
            return {
              type: 'listItem',
              content: [{
                type: 'paragraph',
                content: inlineContent,
              }],
            };
          }),
        };
        nodes.push(listNode);
      } else if (token.type === 'blockquote') {
        nodes.push({
          type: 'blockquote',
          content: [{
            type: 'paragraph',
            content: token.tokens ? parseInlineTokens(token.tokens) : [{ type: 'text', text: token.text }],
          }],
        });
      } else if (token.type === 'code') {
        nodes.push({
          type: 'codeBlock',
          attrs: { language: token.lang || null },
          content: [{ type: 'text', text: token.text }],
        });
      } else if (token.type === 'table') {
        const tableNode = {
          type: 'table',
          content: token.rows.map((row) => ({
            type: 'tableRow',
            content: row.map((cell) => ({
              type: 'tableCell',
              content: [{
                type: 'paragraph',
                content: [{ type: 'text', text: cell }],
              }],
            })),
          })),
        };
        nodes.push(tableNode);
      } else if (token.type === 'space') {
        // Skip space tokens - they're just blank lines between blocks
        continue;
      }
    }

    return nodes;
  }

  async function fillEditorWithText(markdownText: string) {
    const nodes = parseMarkdownToNodes(markdownText);
    // Insert all nodes at once to prevent progressive indentation
    props.editor.chain().focus().insertContent(nodes).run();
  }

  async function replaceSelectedTextWithText(text: string) {
    const nodes = parseMarkdownToNodes(text);

    // Delete the selected text
    props.editor.chain().focus().deleteSelection().run();

    // Insert all nodes at once to prevent progressive indentation
    props.editor.chain().focus().insertContent(nodes).run();
  }

  async function insertQuizAfterSelection(aiResponse: string) {
    try {
      const questions = [];
      let currentQuestion = null;
      let currentAnswers = [];
      
      // Clean the response
      const cleanedResponse = aiResponse
        .replace(/```[\w]*\n?/g, '') // Remove code blocks
        .replace(/\*\*/g, '') // Remove bold markers
        .trim();
      
      const lines = cleanedResponse.split('\n').filter(line => line.trim());
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if this is a question line (Q1:, Q2:, etc., or just a question mark at the end)
        const questionMatch = line.match(/^Q\d+[:\s]+(.*)/i) || 
                            (line.endsWith('?') && !line.match(/^[A-Z]\)/)) ? [null, line.replace(/^Q\d+[:\s]+/i, '')] : null;
        
        if (questionMatch) {
          // Save previous question if exists
          if (currentQuestion && currentAnswers.length > 0) {
            questions.push({
              question_id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              question: currentQuestion,
              type: 'multiple_choice',
              answers: currentAnswers,
            });
          }
          
          // Start new question
          currentQuestion = questionMatch[1].trim();
          currentAnswers = [];
        }
        // Check if this is an answer line (A), B), C), etc.)
        else if (line.match(/^[A-Z]\)/)) {
          const answerMatch = line.match(/^([A-Z])\)\s*(.+)$/);
          if (answerMatch && currentQuestion) {
            const answerText = answerMatch[2].trim();
            const isCorrect = answerText.toLowerCase().includes('[correct]') || 
                            answerText.toLowerCase().includes('(correct)') ||
                            answerText.includes('✓') ||
                            answerText.includes('✔');
            const cleanAnswer = answerText
              .replace(/\[CORRECT\]/gi, '')
              .replace(/\(CORRECT\)/gi, '')
              .replace(/[✓✔]/g, '')
              .trim();
            
            currentAnswers.push({
              answer_id: `answer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              answer: cleanAnswer,
              correct: isCorrect,
            });
          }
        }
      }
      
      // Don't forget the last question
      if (currentQuestion && currentAnswers.length > 0) {
        questions.push({
          question_id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          question: currentQuestion,
          type: 'multiple_choice',
          answers: currentAnswers,
        });
      }
      
      if (questions.length === 0) {
        throw new Error('No questions parsed from response');
      }
      
      // Move cursor to the end of selection
      const { to } = props.editor.state.selection;
      
      // Insert the quiz block after the selection
      props.editor
        .chain()
        .focus()
        .setTextSelection(to)
        .insertContent({
          type: 'blockQuiz',
          attrs: {
            questions: questions,
          },
        })
        .run();
    } catch (error) {
      console.error('Failed to parse quiz:', error);
      console.error('AI Response:', aiResponse);
      // Fallback: insert as text if parsing fails
      await fillEditorWithText(aiResponse);
    }
  }

  const getPrompt = (args: AIPromptsLabels) => {
    const { label, selection } = args
    const promptCommon = "Include headings, paragraphs, lists, and callouts where appropriate. Vary the sentence lengths and write in a creative and compelling way, like a professional writer. Use Australian spelling. Strictly adhere to Markdown 1.0 format in your response."

    if (label === 'Writer') {
      return `Write about ${selection}. Respond only with what you would write. ${promptCommon}`
    } else if (label === 'ContinueWriting') {
      return `Continue writing 3 more sentences based on "${selection}". Do not repeat the sentences that are already present in the provided text and respond only with the new sentences. ${promptCommon}`
    } else if (label === 'MakeLonger') {
      return `Make longer this text longer : "${selection}". Add more details and explanations to enhance the content while maintaining the original meaning. Respond only with the enhanced text. ${promptCommon}`
    } else if (label === 'GenerateQuiz') {
      return `Generate a multiple choice quiz about "${selection}". Create exactly 3 questions.

IMPORTANT: Follow this EXACT format:

Q1: [Write the first question here ending with a question mark?]
A) [First answer option]
B) [Second answer option] [CORRECT]
C) [Third answer option]
D) [Fourth answer option]

Q2: [Write the second question here ending with a question mark?]
A) [First answer option] [CORRECT]
B) [Second answer option]
C) [Third answer option]

Q3: [Write the third question here ending with a question mark?]
A) [First answer option]
B) [Second answer option]
C) [Third answer option] [CORRECT]
D) [Fourth answer option]

Rules:
- Each question must start with Q and a number (Q1:, Q2:, Q3:)
- Each answer must start with a letter and closing parenthesis (A), B), C), D))
- Mark EXACTLY ONE correct answer per question with [CORRECT] after the answer text
- Do NOT include any other text, explanations, or formatting
- Do NOT use markdown formatting, bold text, or code blocks
- Questions must end with a question mark`
    } else if (label === 'Translate') {
      return (
        `Translate "${selection}" to the ${aiEditorState.chatInputValue} language. Respond only with the translated text.`
      )
    }
  }

  const getTipTapEditorSelectedTextGlobal = () => {
    // Get the entire node/paragraph that the user is in
    const pos = props.editor.state.selection.$from.pos // get the cursor position
    const resolvedPos = props.editor.state.doc.resolve(pos) // resolve the position in the document
    const start = resolvedPos.before(1) // get the start position of the node
    const end = resolvedPos.after(1) // get the end position of the node
    const paragraph = props.editor.state.doc.textBetween(start, end, '\n', '\n') // get the text of the node
    return paragraph
  }

  const getTipTapEditorSelectedText = () => {
    const selection = props.editor.state.selection
    const from = selection.from
    const to = selection.to
    const text = props.editor.state.doc.textBetween(from, to)
    return text
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0.3, filter: 'blur(5px)' }}
      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
      exit={{ y: 50, opacity: 0, filter: 'blur(3px)' }}
      transition={{
        type: 'spring',
        bounce: 0.35,
        duration: 1.7,
        mass: 0.2,
        velocity: 2,
      }}
      className="backdrop-blur-md	fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center "
      style={{ pointerEvents: 'none' }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          background:
            'linear-gradient(0deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%), radial-gradient(105.16% 105.16% at 50% -5.16%, rgba(255, 255, 255, 0.18) 0%, rgba(0, 0, 0, 0) 100%), rgb(2 1 25 / 95%)',
        }}
        className="backdrop-blur-md	z-50 rounded-2xl max-w-(--breakpoint-2xl) my-10 mx-auto w-[500px] h-[200px] fixed bottom-16 left-1/2 transform -translate-x-1/2 shadow-xl ring-1 ring-inset ring-white/10 text-white p-3 flex-col-reverse"
      >
        <div className="flex space-x-2 justify-center">
          <Image
            className="outline outline-1 outline-neutral-200/20 rounded-lg"
            width={24}
            src={learnhouseAI_icon}
            alt=""
          />
        </div>
        <div className="flex h-[115px] justify-center mx-auto antialiased">
          <div className="flex items-center justify-center ">
            <AiEditorActionScreen handleOperation={handleOperation} />
          </div>
        </div>
        {aiEditorState.isUserInputEnabled && !aiEditorState.error.isError && (
          <div className="flex items-center space-x-2 cursor-pointer">
            <input
              onKeyDown={handleKeyPress}
              value={aiEditorState.chatInputValue}
              onChange={handleChange}
              placeholder="Ask AI"
              className="ring-1 ring-inset ring-white/20 w-full bg-gray-950/20 rounded-lg outline-hidden px-4 py-2 text-white text-sm placeholder:text-white/30"
            ></input>
            <div
              onClick={() =>
                handleOperation(
                  aiEditorState.selectedTool,
                  aiEditorState.chatInputValue
                )
              }
              className="bg-white/10 px-3  rounded-md outline outline-1 outline-neutral-200/20 py-2 hover:bg-white/20 hover:outline-neutral-200/40 delay-75 ease-linear transition-all"
            >
              <BetweenHorizontalStart
                size={20}
                className="text-white/50 hover:cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const AiEditorToolButton = (props: any) => {
  const dispatchAIEditor = useAIEditorDispatch() as any
  const aiEditorState = useAIEditor() as AIEditorStateTypes

  const handleToolButtonClick = async (
    label:
      | 'Writer'
      | 'ContinueWriting'
      | 'MakeLonger'
      | 'GenerateQuiz'
      | 'Translate'
  ) => {
    if (label === 'Writer') {
      await dispatchAIEditor({ type: 'setSelectedTool', payload: label })
      await dispatchAIEditor({ type: 'setIsUserInputEnabled', payload: true })
      await dispatchAIEditor({ type: 'setIsFeedbackModalOpen' })
    }
    if (label === 'ContinueWriting') {
      await dispatchAIEditor({ type: 'setSelectedTool', payload: label })
      await dispatchAIEditor({ type: 'setIsUserInputEnabled', payload: false })
      await dispatchAIEditor({ type: 'setIsFeedbackModalOpen' })
    }
    if (label === 'MakeLonger') {
      await dispatchAIEditor({ type: 'setSelectedTool', payload: label })
      await dispatchAIEditor({ type: 'setIsUserInputEnabled', payload: false })
      await dispatchAIEditor({ type: 'setIsFeedbackModalOpen' })
    }
    if (label === 'GenerateQuiz') {
      await dispatchAIEditor({ type: 'setSelectedTool', payload: label })
      await dispatchAIEditor({ type: 'setIsUserInputEnabled', payload: false })
      await dispatchAIEditor({ type: 'setIsFeedbackModalOpen' })
    }
    if (label === 'Translate') {
      await dispatchAIEditor({ type: 'setSelectedTool', payload: label })
      await dispatchAIEditor({ type: 'setIsUserInputEnabled', payload: false })
      await dispatchAIEditor({ type: 'setIsFeedbackModalOpen' })
    }
  }

  return (
    <button
      onClick={() => handleToolButtonClick(props.label)}
      className="flex space-x-1.5 items-center bg-white/10 px-2 py-0.5 rounded-md outline outline-1 outline-neutral-200/20 text-sm font-semibold text-white/70 hover:bg-white/20 hover:outline-neutral-200/40 delay-75 ease-linear transition-all"
    >
      {props.label === 'Writer' && <Feather size={14} />}
      {props.label === 'ContinueWriting' && <FastForward size={14} />}
      {props.label === 'MakeLonger' && <FileStack size={14} />}
      {props.label === 'GenerateQuiz' && <HelpCircle size={14} />}
      {props.label === 'Translate' && <Languages size={14} />}
      <span>{props.label}</span>
    </button>
  )
}

const AiEditorActionScreen = ({
  handleOperation,
}: {
  handleOperation: any
}) => {
  const dispatchAIEditor = useAIEditorDispatch() as any
  const aiEditorState = useAIEditor() as AIEditorStateTypes

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await dispatchAIEditor({
      type: 'setChatInputValue',
      payload: event.currentTarget.value,
    })
  }

  return (
    <div>
      {aiEditorState.selectedTool === 'Writer' &&
        !aiEditorState.isWaitingForResponse &&
        !aiEditorState.error.isError && (
          <div className="text-xl text-white/90 font-extrabold space-x-2">
            <span>Write about...</span>
          </div>
        )}
      {aiEditorState.selectedTool === 'ContinueWriting' &&
        !aiEditorState.isWaitingForResponse &&
        !aiEditorState.error.isError && (
          <div className="flex flex-col mx-auto justify-center align-middle items-center">
            <p className="mx-auto flex p-2 text-white/80 mt-4 font-bold justify-center text-sm align-middle">
              Place your cursor at the end of a sentence to continue writing{' '}
            </p>
            <div
              onClick={() => {
                handleOperation(
                  aiEditorState.selectedTool,
                  aiEditorState.chatInputValue
                )
              }}
              className="flex cursor-pointer space-x-1.5 p-4 mt-4 items-center bg-white/10  rounded-md outline outline-1 outline-neutral-200/20 text-2xl font-semibold text-white/70 hover:bg-white/20 hover:outline-neutral-200/40 delay-75 ease-linear transition-all"
            >
              <FastForward size={24} />
            </div>
          </div>
        )}
      {aiEditorState.selectedTool === 'MakeLonger' &&
        !aiEditorState.isWaitingForResponse &&
        !aiEditorState.error.isError && (
          <div className="flex flex-col mx-auto justify-center align-middle items-center">
            <p className="mx-auto flex p-2 text-white/80 mt-4 font-bold justify-center text-sm align-middle">
              Select text to make longer{' '}
            </p>
            <div
              onClick={() => {
                handleOperation(
                  aiEditorState.selectedTool,
                  aiEditorState.chatInputValue
                )
              }}
              className="flex cursor-pointer space-x-1.5 p-4 mt-4 items-center bg-white/10  rounded-md outline outline-1 outline-neutral-200/20 text-2xl font-semibold text-white/70 hover:bg-white/20 hover:outline-neutral-200/40 delay-75 ease-linear transition-all"
            >
              <FileStack size={24} />
            </div>
          </div>
        )}
      {aiEditorState.selectedTool === 'GenerateQuiz' &&
        !aiEditorState.isWaitingForResponse &&
        !aiEditorState.error.isError && (
          <div className="flex flex-col mx-auto justify-center align-middle items-center">
            <p className="mx-auto flex p-2 text-white/80 mt-4 font-bold justify-center text-sm align-middle">
              Select text to generate a quiz from{' '}
            </p>
            <div
              onClick={() => {
                handleOperation(
                  aiEditorState.selectedTool,
                  aiEditorState.chatInputValue
                )
              }}
              className="flex cursor-pointer space-x-1.5 p-4 mt-4 items-center bg-white/10  rounded-md outline outline-1 outline-neutral-200/20 text-2xl font-semibold text-white/70 hover:bg-white/20 hover:outline-neutral-200/40 delay-75 ease-linear transition-all"
            >
              <HelpCircle size={24} />
            </div>
          </div>
        )}
      {aiEditorState.selectedTool === 'Translate' &&
        !aiEditorState.isWaitingForResponse &&
        !aiEditorState.error.isError && (
          <div className="flex flex-col mx-auto justify-center align-middle items-center">
            <div className="mx-auto flex p-2 text-white/80 mt-4 font-bold justify-center text-sm align-middle space-x-6">
              <p>Translate selected text to </p>
              <input
                value={aiEditorState.chatInputValue}
                onChange={handleChange}
                placeholder="Japanese, Arabic, German, etc. "
                className="ring-1 ring-inset ring-white/20 w-full bg-gray-950/20 rounded-lg outline-hidden px-4 py- text-white text-sm placeholder:text-white/30"
              ></input>
            </div>
            <div
              onClick={() => {
                handleOperation(
                  aiEditorState.selectedTool,
                  aiEditorState.chatInputValue
                )
              }}
              className="flex cursor-pointer space-x-1.5 p-4 mt-4 items-center bg-white/10  rounded-md outline outline-1 outline-neutral-200/20 text-2xl font-semibold text-white/70 hover:bg-white/20 hover:outline-neutral-200/40 delay-75 ease-linear transition-all"
            >
              <Languages size={24} />
            </div>
          </div>
        )}
      {aiEditorState.isWaitingForResponse && !aiEditorState.error.isError && (
        <div className="flex flex-col mx-auto justify-center align-middle items-center">
          <svg
            className="animate-spin mt-10 h-10 w-10 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="font-bold mt-4 text-white/90">Thinking...</p>
        </div>
      )}

      {aiEditorState.error.isError && (
        <div className="flex items-center h-auto pt-7">
          <div className="flex flex-col mx-auto w-full space-y-2 p-5 rounded-lg bg-red-500/20 outline outline-1 outline-red-500">
            <AlertTriangle size={20} className="text-red-500" />
            <div className="flex flex-col">
              <h3 className="font-semibold text-red-200">
                Something wrong happened
              </h3>
              <span className="text-red-100 text-sm ">
                {aiEditorState.error.error_message}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIEditorToolkit
