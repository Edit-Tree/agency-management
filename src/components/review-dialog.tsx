'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import { approveWithReview } from "@/app/actions/reviews"
import { RevisionRequestDialog } from "./revision-request-dialog"

interface ReviewDialogProps {
    ticketId: string
    ticketTitle: string
    userId: string
}

export function ReviewDialog({ ticketId, ticketTitle, userId }: ReviewDialogProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [review, setReview] = useState("")
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            alert("Please select a rating")
            return
        }

        setLoading(true)
        await approveWithReview(ticketId, rating, review)
        setLoading(false)
        setOpen(false)
        window.location.reload()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Review Work</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Review Completed Work</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div>
                        <p className="text-sm text-muted-foreground mb-4">
                            How would you rate the work on: <strong>{ticketTitle}</strong>
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Rating</Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${star <= (hoverRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {rating === 0 && "Click to rate"}
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent"}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="review">Review (Optional)</Label>
                        <Textarea
                            id="review"
                            placeholder="Share your thoughts about the work..."
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="flex justify-between gap-2">
                        <RevisionRequestDialog ticketId={ticketId} userId={userId} />
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={loading || rating === 0}>
                                {loading ? 'Submitting...' : 'Approve & Submit'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
