package io.github.David_Rn01.API_OFC.repository;


import io.github.David_Rn01.API_OFC.model.Viagem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface ViagemRepository extends JpaRepository<Viagem, Integer> {
    Optional<Viagem> findById(Integer id);
    boolean existsById(Integer id);
}
