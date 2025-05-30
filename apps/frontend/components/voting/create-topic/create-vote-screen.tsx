"use client";

import { useState } from "react";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { FileText } from "lucide-react";

// ============
// Function: CreateVoteScreen
// ------------
// DESCRIPTION: Displays a form for users to propose a voting subject with title, description, format, comments, and submit button. Handles validation and feedback.
// PARAMS: None
// RETURNS: JSX.Element (the voting creation form UI)
// ============
const CreateVoteScreen = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isContributor, setIsContributor] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTitle("");
      setDescription("");
      setFormat("");
      setComments("");
    }, 1200);
  };

  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <header className="pt-4 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-7 w-7 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Create a new vote</h1>
        </div>
        <p className="text-muted-foreground max-w-xl">
          Share your idea and let the community decide. Fill in the details
          below to propose a new voting subject.
        </p>
      </header>
      <form
        className="w-full flex flex-col gap-6 px-0 md:px-8 py-8"
        onSubmit={handleSubmit}
        aria-label="Create a new vote"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">
          Submit a subject
        </h2>
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the subject title"
            required
            aria-required="true"
            aria-label="Vote title"
            tabIndex={0}
            maxLength={80}
            className=""
          />
          <span className="text-xs text-muted-foreground">
            Max 80 characters
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of the subject"
            required
            aria-required="true"
            aria-label="Vote description"
            tabIndex={0}
            maxLength={200}
            className="min-h-[60px]"
          />
          <span className="text-xs text-muted-foreground">
            Max 200 characters
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="format">Format (optional)</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger id="format" aria-label="Format">
              <SelectValue placeholder="Select a format (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masterclass">Masterclass</SelectItem>
              <SelectItem value="whitepaper">White paper</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="contributor"
            checked={isContributor}
            onCheckedChange={setIsContributor}
            aria-label="I want to be a contributor"
          />
          <Label htmlFor="contributor" className="cursor-pointer select-none">
            I want to be a contributor
          </Label>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="comments">Comments (optional)</Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add any additional comments (optional)"
            aria-label="Comments"
            tabIndex={0}
            maxLength={400}
            className="min-h-[80px]"
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-600 text-sm" role="status">
            Vote submitted successfully!
          </div>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !title.trim() || !description.trim()}
          aria-disabled={isSubmitting || !title.trim() || !description.trim()}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </section>
  );
};

export default CreateVoteScreen;
