-- Correction to 20260930170000: a module opens on the Wednesday BEFORE its
-- class week, not after it. Members study the module first, and hand in
-- its guided task by the time Monday's class starts (19.00), because the
-- task counts towards attendance. Every `rilis` moves back one week, for
-- example M03 from 7 Oct to 30 Sep (class 5 Oct) and M04 from 4 Nov to
-- 28 Oct (class 2 Nov, after midterms). The class week is the Monday after
-- `rilis`, derived in code.

update public.modules set rilis = rilis - 7;
