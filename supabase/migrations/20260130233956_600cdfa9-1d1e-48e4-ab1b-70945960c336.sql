-- Allow users to delete their own diet state rows (right to erasure)
CREATE POLICY "Users can delete own diet states"
ON public.user_diet_states
FOR DELETE
USING (auth.uid() = user_id);
