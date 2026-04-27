"use client";

import { useEffect, useState } from "react";
import { getExerciseById } from "@/features/exercises/api/getExercises";
import { Exercise } from "@/features/exercises/types/exerciseTypes";


export function useExerciseModal() {
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [modalExerciseDetail, setModalExerciseDetail] = useState<Exercise | null>(null);
  const [modalExerciseLoading, setModalExerciseLoading] = useState(false);

  // Fetch exercise details when modal opens
  useEffect(() => {
    if (!isInfoModalVisible || !selectedExerciseId) {
      setModalExerciseDetail(null);
      return;
    }

    let cancelled = false;

    const loadExerciseDetail = async () => {
      setModalExerciseLoading(true);
      try {
        const detail = await getExerciseById(selectedExerciseId);
        if (!cancelled) {
          setModalExerciseDetail(detail);
        }
      } catch (error) {
        console.error("Failed to load exercise details:", error);
      } finally {
        if (!cancelled) {
          setModalExerciseLoading(false);
        }
      }
    };

    loadExerciseDetail();

    return () => {
      cancelled = true;
    };
  }, [isInfoModalVisible, selectedExerciseId]);

  const openModal = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setInfoModalVisible(true);
  };

  const closeModal = () => {
    setInfoModalVisible(false);
    setSelectedExerciseId(null);
    setModalExerciseDetail(null);
  };

  return {
    isInfoModalVisible,
    selectedExerciseId,
    modalExerciseDetail,
    modalExerciseLoading,
    openModal,
    closeModal,
  };
}