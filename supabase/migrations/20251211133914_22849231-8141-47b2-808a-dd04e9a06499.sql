-- Shift existing calendars down by 2 positions
UPDATE calendars SET display_order = display_order + 2;

-- Insert calendar 2027 at position 1
INSERT INTO calendars (name, year, pdf_url, display_order)
VALUES ('Calendário de 2027', 2027, '/calendars/cal2027.pdf', 1);

-- Insert calendar 2026 at position 2
INSERT INTO calendars (name, year, pdf_url, display_order)
VALUES ('Calendário de 2026', 2026, '/calendars/cal2026.pdf', 2);