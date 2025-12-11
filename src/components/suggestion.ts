
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { MentionList } from './mention-list'

export default {
    items: ({ query, editor }: { query: string, editor: any }) => {
        // Get members from editor storage or props? 
        // Actually, items function usually filters a passed list.
        // We will pass the list via the extension configuration in the component where we instantiate it.
        // But this file just exports the default configuring logic.
        // We'll define the 'items' filtering here assuming 'editor.storage.mention.members' exists or similar?
        // OR we can pass the items directly. 
        // TipTap pattern: define this in the component if it depends on component state (members list).
        // So this file might just export the `render` logic which is generic.
        return []
    },

    render: () => {
        let component: ReactRenderer | null = null
        let popup: any[] = []

        return {
            onStart: (props: any) => {
                component = new ReactRenderer(MentionList, {
                    props,
                    editor: props.editor,
                })

                if (!props.clientRect) {
                    return
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                })
            },

            onUpdate(props: any) {
                component?.updateProps(props)

                if (!props.clientRect) {
                    return
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                })
            },

            onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                    popup[0].hide()

                    return true
                }

                return component?.ref?.onKeyDown(props)
            },

            onExit() {
                popup[0].destroy()
                component?.destroy()
            },
        }
    },
}
