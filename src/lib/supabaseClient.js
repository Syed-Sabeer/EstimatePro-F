import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rwiecmlbaqmwlbkbxgyl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3aWVjbWxiYXFtd2xia2J4Z3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNDgzMTcsImV4cCI6MjA2MzgyNDMxN30.Z8btHIDQlvQ2rK1sopCcvQ21q7RJj6mbiCxdiZl1EWs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);