--
-- PostgreSQL database dump
--

\restrict 85WdEHysUMD2IOCdh37VKmlIMvbNp0sb0PyhvgE7khJEsuFC57gU4dwz1xT1Qfx

-- Dumped from database version 16.11 (Homebrew)
-- Dumped by pg_dump version 18.0

-- Started on 2026-01-12 20:43:17 +03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 855 (class 1247 OID 16496)
-- Name: appliancestatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.appliancestatus AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'MAINTENANCE',
    'ERROR'
);


--
-- TOC entry 852 (class 1247 OID 16488)
-- Name: recipedifficulty; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.recipedifficulty AS ENUM (
    'EASY',
    'MEDIUM',
    'HARD'
);


--
-- TOC entry 849 (class 1247 OID 16480)
-- Name: userrole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.userrole AS ENUM (
    'ADMIN',
    'USER',
    'GUEST'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16596)
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    action character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id uuid,
    details jsonb,
    ip_address character varying(45),
    user_agent character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 16629)
-- Name: appliance_usage_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appliance_usage_logs (
    id uuid NOT NULL,
    appliance_id uuid NOT NULL,
    action character varying(100) NOT NULL,
    duration integer,
    energy_used double precision,
    temperature double precision,
    settings_used jsonb,
    metrics jsonb,
    error_logs jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 16554)
-- Name: appliances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appliances (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(100) NOT NULL,
    brand character varying(100),
    model character varying(100),
    status public.appliancestatus NOT NULL,
    settings jsonb,
    last_maintenance timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 216 (class 1259 OID 16516)
-- Name: ingredients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredients (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(100),
    unit character varying(50),
    calories_per_unit double precision,
    additional_data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 217 (class 1259 OID 16526)
-- Name: magic_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.magic_links (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_used boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 16611)
-- Name: meal_plan_recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_plan_recipes (
    id uuid NOT NULL,
    meal_plan_id uuid NOT NULL,
    recipe_id uuid NOT NULL,
    scheduled_date timestamp with time zone NOT NULL,
    meal_type character varying(50),
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 16568)
-- Name: meal_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_plans (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    description text,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 218 (class 1259 OID 16539)
-- Name: recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipes (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    difficulty public.recipedifficulty,
    prep_time integer,
    cook_time integer,
    servings integer,
    ingredients jsonb NOT NULL,
    instructions jsonb NOT NULL,
    nutrition_info jsonb,
    tags jsonb,
    is_public boolean,
    image_url character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16582)
-- Name: shopping_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shopping_lists (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    items jsonb NOT NULL,
    is_completed boolean,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 215 (class 1259 OID 16505)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255),
    role public.userrole NOT NULL,
    is_active boolean NOT NULL,
    preferences jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 3754 (class 2606 OID 16603)
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3760 (class 2606 OID 16636)
-- Name: appliance_usage_logs appliance_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appliance_usage_logs
    ADD CONSTRAINT appliance_usage_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3748 (class 2606 OID 16562)
-- Name: appliances appliances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appliances
    ADD CONSTRAINT appliances_pkey PRIMARY KEY (id);


--
-- TOC entry 3738 (class 2606 OID 16524)
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- TOC entry 3743 (class 2606 OID 16531)
-- Name: magic_links magic_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.magic_links
    ADD CONSTRAINT magic_links_pkey PRIMARY KEY (id);


--
-- TOC entry 3758 (class 2606 OID 16618)
-- Name: meal_plan_recipes meal_plan_recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_recipes
    ADD CONSTRAINT meal_plan_recipes_pkey PRIMARY KEY (id);


--
-- TOC entry 3750 (class 2606 OID 16576)
-- Name: meal_plans meal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 3746 (class 2606 OID 16547)
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- TOC entry 3752 (class 2606 OID 16590)
-- Name: shopping_lists shopping_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_lists
    ADD CONSTRAINT shopping_lists_pkey PRIMARY KEY (id);


--
-- TOC entry 3736 (class 2606 OID 16513)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3755 (class 1259 OID 16610)
-- Name: ix_activity_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_activity_logs_action ON public.activity_logs USING btree (action);


--
-- TOC entry 3756 (class 1259 OID 16609)
-- Name: ix_activity_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_activity_logs_created_at ON public.activity_logs USING btree (created_at);


--
-- TOC entry 3761 (class 1259 OID 16642)
-- Name: ix_appliance_usage_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_appliance_usage_logs_created_at ON public.appliance_usage_logs USING btree (created_at);


--
-- TOC entry 3739 (class 1259 OID 16525)
-- Name: ix_ingredients_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_ingredients_name ON public.ingredients USING btree (name);


--
-- TOC entry 3740 (class 1259 OID 16538)
-- Name: ix_magic_links_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_magic_links_expires_at ON public.magic_links USING btree (expires_at);


--
-- TOC entry 3741 (class 1259 OID 16537)
-- Name: ix_magic_links_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_magic_links_token ON public.magic_links USING btree (token);


--
-- TOC entry 3744 (class 1259 OID 16553)
-- Name: ix_recipes_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_recipes_name ON public.recipes USING btree (name);


--
-- TOC entry 3733 (class 1259 OID 16514)
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- TOC entry 3734 (class 1259 OID 16515)
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- TOC entry 3767 (class 2606 OID 16604)
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3770 (class 2606 OID 16637)
-- Name: appliance_usage_logs appliance_usage_logs_appliance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appliance_usage_logs
    ADD CONSTRAINT appliance_usage_logs_appliance_id_fkey FOREIGN KEY (appliance_id) REFERENCES public.appliances(id) ON DELETE CASCADE;


--
-- TOC entry 3764 (class 2606 OID 16563)
-- Name: appliances appliances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appliances
    ADD CONSTRAINT appliances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3762 (class 2606 OID 16532)
-- Name: magic_links magic_links_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.magic_links
    ADD CONSTRAINT magic_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3768 (class 2606 OID 16619)
-- Name: meal_plan_recipes meal_plan_recipes_meal_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_recipes
    ADD CONSTRAINT meal_plan_recipes_meal_plan_id_fkey FOREIGN KEY (meal_plan_id) REFERENCES public.meal_plans(id) ON DELETE CASCADE;


--
-- TOC entry 3769 (class 2606 OID 16624)
-- Name: meal_plan_recipes meal_plan_recipes_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_recipes
    ADD CONSTRAINT meal_plan_recipes_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- TOC entry 3765 (class 2606 OID 16577)
-- Name: meal_plans meal_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3763 (class 2606 OID 16548)
-- Name: recipes recipes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3766 (class 2606 OID 16591)
-- Name: shopping_lists shopping_lists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopping_lists
    ADD CONSTRAINT shopping_lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-01-12 20:43:17 +03

--
-- PostgreSQL database dump complete
--

\unrestrict 85WdEHysUMD2IOCdh37VKmlIMvbNp0sb0PyhvgE7khJEsuFC57gU4dwz1xT1Qfx

